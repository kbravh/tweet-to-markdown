#!/usr/bin/env node

const commandLineArgs = require(`command-line-args`)
const commandLineUsage = require(`command-line-usage`)
const chalk = require(`chalk`)
const fs = require(`fs`)
const fsp = fs.promises
const path = require(`path`)
const util = require(`./util`)
const log = console.log

/**
 * The definitions of the command line flags
 */
const optionDefinitions = [
  { name: `src`, defaultOption: true },
  { name: `help`, alias: `h`, type: Boolean, description: "Display this usage guide." },
  { name: `bearer`, alias: `b`, description: "The bearer token from the Twitter developer account to authenticate requests." },
  { name: `clipboard`, alias: `c`, type: Boolean, description: "Copy the generated markdown to the clipboard instead of saving a Markdown file."},
  { name: `path`, alias: `p`, description: "The path to save the file. This path must {italic already exist}. Defaults to the current directory." },
  { name: `filename`, description: "The name of the markdown file to be saved. The .md extension will be automatically added. You can use the variables [[name]], [[handle]], and [[id]]." },
  { name: `force`, alias: `f`, type: Boolean, description: "Overwrite the file if it already exists." },
  { name: `metrics`, alias: `m`, type: Boolean, description: "Store the number of likes, tweets, and replies in the frontmatter of the document." },
]

/**
 * The definition of the help page
 */
const help = [
  {
    header: "Tweet to Markdown",
    content: "Quickly and easily save Tweets as Markdown files."
  },
  {
    header: "Usage",
    content: "ttm [flags] <tweet url or id>"
  },
  {
    header: "Options",
    optionList: optionDefinitions,
    hide: "src" // src is the default option so we won't show it in the main list
  }

]

// Parse the command line options and generate the help page
const options = commandLineArgs(optionDefinitions)
const helpPage = commandLineUsage(help)

/**
 * Show the help page if requested and immediately end execution
 */
if (options.help) {
  log(helpPage)
  process.exit(0)
}

/**
 * If no tweet source was provided, panic
 */
if (!options.src) {
  util.panic(chalk`{red A tweet url or id was not provided.}\n{bold {underline Usage}}: ttm [options] <url or id>`)
}

// Pull 🐻 token first from options, then from environment variable
let bearer = options.bearer || process.env.TWITTER_BEARER_TOKEN

/**
 * If no 🐻 token provided, panic
 */
if (!bearer) {
  util.panic(chalk`{red No authorization provided.} You must provide your bearer token.`)
}

// extract tweet ID from URL ID
let id = util.getTweetID(options)

/**
 * 
 * @param {tweet} tweet - The entire tweet object provided by the Twitter v2 API
 */
const buildMarkdown = tweet => {
  let metrics = []
  if (options.metrics) {
    metrics = [
      `likes: ${tweet.data.public_metrics.like_count}`,
      `retweets: ${tweet.data.public_metrics.retweet_count}`,
      `replies: ${tweet.data.public_metrics.reply_count}`
    ]
  }

  let text = tweet.data.text

  /**
   * replace entities with markdown links
   */
  if (tweet.data.entities) {
    /**
     * replace any mentions with links
     */
    let mentions = []
    // first, add the @ before any mentions
    tweet.data.entities.mentions && tweet.data.entities.mentions.forEach(mention => {
      mentions.push(mention.username)
      text = text.substring(0, mention.start) + `@${mention.username}` + text.substring(mention.end + 1)
    })
    // then, replace all @s with their hyperlinks
    for (const mention of mentions) {
      text = text.replace(`@${mention}`, ` [@${mention}](https://twitter.com/${mention})`)
    }

    /**
     * replace any hashtags with links
     */
    let hashtags = []
    // first, add the # before any hashtags
    tweet.data.entities.hashtags && tweet.data.entities.hashtags.forEach(hashtag => {
      hashtags.push(hashtag.tag)
      text = text.substring(0, hashtag.start) + `#${hashtag.tag}` + text.substring(hashtag.end + 1)
    })
    // then, replace all #s with their hyperlinks
    for (const hashtag of hashtags) {
      text = text.replace(`#${hashtag}`, ` [#${hashtag}](https://twitter.com/hashtag/${hashtag}) `)
    }

    /**
     * replace hyperlinks with markdown links
     */
    tweet.data.entities.urls && tweet.data.entities.urls.forEach(url => {
      text = text.replace(url.url, `[${url.display_url}](${url.expanded_url})`)
    })
  }

  /**
   * Define the frontmatter as the name and handle
   */
  let frontmatter = [
    `---`,
    `author: ${tweet.includes.users[0].name}`,
    `handle: @${tweet.includes.users[0].username}`,
    ...metrics,
    `---`
  ]

  let markdown = [
    `![${tweet.includes.users[0].username}](${tweet.includes.users[0].profile_image_url})`, // profile image
    `${tweet.includes.users[0].name} ([@${tweet.includes.users[0].username}](https://twitter.com/${tweet.includes.users[0].username}))`, // name and handle
    `\n`,
    `${text}` // text of the tweet
  ]

  // add extra lines for line breaks in markdown
  markdown = markdown.map(line => line.replace(/\n/g, '\n\n'))

  // Add in other tweet elements
  if (tweet.includes.polls) {
    markdown = markdown.concat(util.createPollTable(tweet.includes.polls))
  }

  if (tweet.includes.media) {
    markdown = markdown.concat(util.createMediaElements(tweet.includes.media))
  }

  return frontmatter.concat(markdown).join('\n')
}

/**
 * 
 * @param {tweet} tweet - The entire tweet object from the Twitter v2 API
 * @param {string} markdown - The markdown string to be written to the file
 */
const writeTweet = async (tweet, markdown) => {
  let filepath = ''
  // check if path provided by user is valid and writeable
  if (options.path) {
    await util.testPath(options.path)
    filepath = options.path
  }

  // create filename
  let filename = util.createFilename(tweet, options)
  // combine name and path
  filepath = path.format({ dir: filepath, base: filename })

  //check if file already exists
  fsp.access(filepath, fs.constants.F_OK).then(_ => {
    if (!options.force) {
      util.panic(chalk`{red File already exists.} Use {bold --force (-f)} to overwrite.`)
    }
  }).catch(error => {
    //file does not exist so we can write to it
  })

  // write the tweet to the file
  await fsp.writeFile(filepath, markdown).catch(error => {
    util.panic(error)
  })
  log(chalk`Tweet saved to {bold {underline ${filepath}}}`)
}

const main = async () => {
  let tweet = await util.getTweet(id, bearer)
  let markdown = buildMarkdown(tweet)
  if(options.clipboard){
    util.copyToClipboard(markdown)
  }else {
    writeTweet(tweet, markdown)
  }
}

main()
