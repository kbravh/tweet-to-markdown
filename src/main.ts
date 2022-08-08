import commandLineArgs from 'command-line-args'
import commandLineUsage, {OptionDefinition} from 'command-line-usage'
import chalk from 'chalk'
import { processTweetRequest } from './process'
import { log, panic } from './util'

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

const main = async () => {
  await processTweetRequest(options)
}

main()
