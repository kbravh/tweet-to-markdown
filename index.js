#!/usr/bin/env node

const commandLineArgs = require(`command-line-args`);
const commandLineUsage = require(`command-line-usage`);
const chalk = require(`chalk`);
const fs = require(`fs`);
const fsp = fs.promises;
const path = require(`path`);
const util = require(`./util`);
const log = console.info;
const types = require('./types')

/**
 * The definitions of the command line flags
 */
const optionDefinitions = [
  { name: `src`, defaultOption: true },
  { name: `help`, alias: `h`, type: Boolean, description: 'Display this usage guide.' },
  { name: `bearer`, alias: `b`, description: 'The bearer token from the Twitter developer account to authenticate requests.' },
  { name: `clipboard`, alias: `c`, type: Boolean, description: 'Copy the generated markdown to the clipboard instead of saving a Markdown file.' },
  { name: `path`, alias: `p`, description: 'The path to save the file. This path must {italic already exist}. Defaults to the current directory.' },
  { name: `assets`, alias: `a`, type: Boolean, description: 'Save tweet images locally instead of just a link.' },
  { name: `assets-path`, description: 'The path to store the tweet images.' },
  { name: `filename`, description: 'The name of the markdown file to be saved. The .md extension will be automatically added. You can use the variables [[name]], [[handle]], and [[id]].' },
  { name: `force`, alias: `f`, type: Boolean, description: 'Overwrite the file if it already exists.' },
  { name: `metrics`, alias: `m`, type: Boolean, description: 'Store the number of likes, tweets, and replies in the frontmatter of the document.' },
  { name: `quoted`, alias: `q`, type: Boolean, description: 'Fetch and store quoted tweets in the document instead of just a link.' },
  { name: `thread`, alias: `t`, type: Boolean, description: 'Save an entire tweet thread (starting with the final tweet) in a single document.' },
];

/**
 * The definition of the help page
 */
const help = [
  {
    header: 'Tweet to Markdown',
    content: 'Quickly and easily save Tweets as Markdown files.',
  },
  {
    header: 'Usage',
    content: 'ttm [flags] <tweet url or id>',
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
    hide: 'src', // src is the default option so we won't show it in the main list
  },
];

// Parse the command line options and generate the help page
const options = commandLineArgs(optionDefinitions, { camelCase: true });
const helpPage = commandLineUsage(help);

/**
 * Show the help page if requested and immediately end execution
 */
if (options.help) {
  log(helpPage);
  process.exit(0);
}

/**
 * If no tweet source was provided, panic
 */
if (!options.src) {
  util.panic(chalk`{red A tweet url or id was not provided.}\n{bold {underline Usage}}: ttm [options] <url or id>`);
}

// pull 🐻 token first from options, then from environment variable
if (!options.bearer) {
  options.bearer = process.env.TWITTER_BEARER_TOKEN;
}

// if no 🐻 token provided, panic
if (!options.bearer) {
  util.panic(chalk`{red No authorization provided.} You must provide your bearer token.`);
}

// extract tweet ID from URL
let id = util.getTweetID(options);

/**
 * Writes the tweet to a markdown file.
 * @param {types.Tweet} tweet - The entire tweet object from the Twitter v2 API
 * @param {string} markdown - The markdown string to be written to the file
 */
const writeTweet = async (tweet, markdown, options) => {
  let filepath = '';
  // check if path provided by user is valid and writeable
  if (options.path) {
    await util.testPath(options.path);
    filepath = options.path;
  }

  // create filename
  let filename = util.createFilename(tweet, options);
  // combine name and path
  filepath = path.format({ dir: filepath, base: filename });

  //check if file already exists
  await fsp
    .access(filepath, fs.constants.F_OK)
    .then((_) => {
      if (!options.force) {
        util.panic(chalk`{red File already exists.} Use {bold --force (-f)} to overwrite.`);
      }
    })
    .catch((error) => {
      //file does not exist so we can write to it
    });

  // write the tweet to the file
  await fsp.writeFile(filepath, markdown).catch((error) => {
    util.panic(error);
  });
  log(chalk`Tweet saved to {bold {underline ${filepath}}}`);
};

const main = async () => {
  let tweet = await util.getTweet(id, options.bearer);
  let final = '';

  // special handling for threads
  if (options.thread) {
    // check if this is the head tweet
    while (tweet.data.conversation_id !== tweet.data.id) {
      let markdown = await util.buildMarkdown(tweet, options, 'thread');
      final = markdown + final;
      // load in parent tweet
      let [parent_tweet] = tweet.data.referenced_tweets.filter((ref_tweet) => ref_tweet.type === 'replied_to');
      tweet = await util.getTweet(parent_tweet.id, options.bearer);
    }
  }
  let markdown = await util.buildMarkdown(tweet, options);
  final = markdown + final;

  if (options.clipboard) {
    util.copyToClipboard(final);
  } else {
    writeTweet(tweet, final, options);
  }
};

main();
