import commandLineArgs from 'command-line-args'
import commandLineUsage, {OptionDefinition} from 'command-line-usage'
import chalk from 'chalk'
import fs from 'fs'
import {
  buildMarkdown,
  copyToClipboard,
  getTweet,
  getTweetID,
  panic,
  writeTweet,
} from './util'
import {ReferencedTweet, Tweet} from './models'
import axios from 'axios'
const log = console.info

/**
 * The definitions of the command line flags
 */
const optionDefinitions: OptionDefinition[] = [
  {name: 'src', defaultOption: true},
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.',
  },
  {
    name: 'bearer',
    alias: 'b',
    description:
      'The bearer token from the Twitter developer account to authenticate requests.',
  },
  {
    name: 'clipboard',
    alias: 'c',
    type: Boolean,
    description:
      'Copy the generated markdown to the clipboard instead of saving a Markdown file.',
  },
  {
    name: 'path',
    alias: 'p',
    description:
      'The path to save the file. This path must {italic already exist}. Defaults to the current directory.',
  },
  {
    name: 'assets',
    alias: 'a',
    type: Boolean,
    description: 'Save tweet images locally instead of just a link.',
  },
  {name: 'assets-path', description: 'The path to store the tweet images.'},
  {
    name: 'filename',
    description:
      'The name of the markdown file to be saved. The .md extension will be automatically added. You can use the variables [[name]], [[handle]], [[text]], and [[id]].',
  },
  {
    name: 'force',
    alias: 'f',
    type: Boolean,
    description: 'Overwrite the file if it already exists.',
  },
  {
    name: 'metrics',
    alias: 'm',
    type: Boolean,
    description:
      'Store the number of likes, tweets, and replies in the frontmatter of the document.',
  },
  {
    name: 'quoted',
    alias: 'q',
    type: Boolean,
    description:
      'Fetch and store quoted tweets in the document instead of just a link.',
  },
  {
    name: 'thread',
    alias: 't',
    type: Boolean,
    description:
      'Save an entire tweet thread in a single document. Use the link of the last tweet.',
  },
  {
    name: 'condensed_thread',
    alias: 'T',
    type: Boolean,
    description:
      'Save an entire tweet thread in a single document, but only show the author on the first tweet or on author changes. Use the link of the last tweet.',
  },
]

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
]

// Parse the command line options and generate the help page
const options = commandLineArgs(optionDefinitions, {camelCase: true})
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
  panic(
    chalk`{red A tweet url or id was not provided.}\n{bold {underline Usage}}: ttm [options] <url or id>`
  )
}

// pull 🐻 token first from options, then from environment variable
if (!options.bearer) {
  options.bearer = process.env.TTM_API_KEY ?? process.env.TWITTER_BEARER_TOKEN
}

// if no 🐻 token provided, panic
if (!options.bearer) {
  panic(
    chalk`{red No authorization provided.} You must provide your bearer token.`
  )
}

// extract tweet ID from URL
const id = getTweetID(options)

const main = async () => {
  const tweets: Tweet[] = []
  let error: Error
  let currentTweet: Tweet
  try {
    currentTweet = await getTweet(id, options.bearer)
  } catch (err) {
    error = err
  }

  !error && tweets.push(currentTweet)
  // special handling for threads
  if (options.thread || options.condensedThread) {
    // check if this is the head tweet
    while (currentTweet?.data?.conversation_id !== currentTweet?.data?.id) {
      // load in parent tweet
      const [parent_tweet] = currentTweet.data.referenced_tweets.filter(
        (ref_tweet: ReferencedTweet) => ref_tweet.type === 'replied_to'
      )
      try {
        currentTweet = await getTweet(parent_tweet.id, options.bearer)
      } catch (err) {
        error = err
        break
      }
      tweets.push(currentTweet)
    }
  }
  if (error && !tweets.length) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        panic(chalk.red(error.response.statusText))
      } else if (error.request) {
        panic(chalk.red('There seems to be a connection issue.'))
      } else {
        panic(chalk.red('An error occurred.'))
      }
    }
    panic(chalk`{red Unfortunately, an error occurred:} ${error.message}`)
  }

  if (error && tweets.length) {
    log(
      chalk`{red An error occurred while downloading tweets.} I'll generate your markdown file with the information I did fetch.`
    )
  }
  // reverse the thread so the tweets are in chronological order
  tweets.reverse()
  const markdowns = await Promise.all(
    tweets.map(async (tweet, index) => {
      return await buildMarkdown(
        tweet,
        options,
        index === 0 ? 'normal' : 'thread',
        index === 0 ? null : tweets[index - 1].includes.users[0]
      )
    })
  )
  const firstTweet = tweets[0]
  if (options.condensedThread) {
    markdowns.push(
      '',
      '',
      `[Thread link](https://twitter.com/${firstTweet.includes.users[0].username}/status/${firstTweet.data.id})`
    )
  }

  const final = options.condensedThread
    ? markdowns.join('\n\n')
    : markdowns.join('\n\n---\n\n')

  if (options.clipboard) {
    copyToClipboard(final)
  } else {
    writeTweet(firstTweet, final, options)
  }
}

main()
