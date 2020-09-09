#!/usr/bin/env node

const { default: Axios } = require("axios")
const commandLineArgs = require(`command-line-args`)
const commandLineUsage = require(`command-line-usage`)
const fs = require(`fs`)
const fsp = fs.promises
const path = require(`path`)

const errorMessage = message => {
  console.error(message)
  process.exit(1)
}

const optionDefinitions = [
  { name: `src`, defaultOption: true },
  { name: `help`, alias: `h`, type: Boolean, description: "Display this usage guide." },
  { name: `bearer`, alias: `b`, description: "The bearer token from the Twitter developer account to authenticate requests." },
  { name: `path`, alias: `p`, description: "The path to save the file. This path must {italic already exist}. Defaults to the current directory." },
  { name: `filename`, description: "The name of the markdown file to be saved. The .md extension will be automatically added. You can use the variables [[name]], [[handle]], and [[id]]." },
  { name: `force`, alias: `f`, type: Boolean, description: "Overwrite the file if it already exists." },
  { name: `metrics`, alias: `m`, type: Boolean, description: "Store the number of likes, tweets, and replies in the frontmatter of the document." },
]

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

const options = commandLineArgs(optionDefinitions)
const helpPage = commandLineUsage(help)

if (options.help) {
  console.log(helpPage)
  process.exit(0)
}

if (!options.src) {
  errorMessage(`A tweet url or id was not provided. Usage: ttm [options] <url or id>`)
}

let bearer = options.bearer || process.env.TWITTER_BEARER_TOKEN

if (!bearer) {
  errorMessage(`No authorization provided. You must provide your bearer token.`)
}

let id
// extract tweet ID from URL ID
try {
  // Create a URL object with the source. If it fails, it's not a URL.
  let url = new URL(options.src)
  id = url.pathname.split('/').slice(-1)[0]
} catch (error) {
  id = options.src
}

// fetch tweet from Twitter API
const getTweet = async id => {
  let twitterUrl = new URL(`https://api.twitter.com/2/tweets/${id}`)
  let params = new URLSearchParams({
    "expansions": "author_id,attachments.poll_ids,attachments.media_keys",
    "user.fields": "name,username,profile_image_url",
    "tweet.fields": "attachments,public_metrics,entities",
    "media.fields": "url",
    "poll.fields": "options"
  })

  return await Axios({
    method: `GET`,
    url: `${twitterUrl.href}?${params.toString()}`,
    headers: { 'Authorization': `Bearer ${bearer}` }
  })
    .then(response => response.data)
    .catch(error => {
      if (error.response) {
        errorMessage(error.response.statusText)
      } else if (error.request) {
        errorMessage(`There seems to be a connection issue.`)
      } else {
        errorMessage(`An error occurred.`)
      }
    })
}

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
  // replace entities with markdown links
  if (tweet.data.entities) {
    // replace any mentions with links
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
    // replace any hashtags with links
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

    // replace hyperlinks with markdown links
    tweet.data.entities.urls && tweet.data.entities.urls.forEach(url => {
      text = text.replace(url.url, `[${url.display_url}](${url.expanded_url})`)
    })
  }

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

  // Add in other tweet elements
  if (tweet.includes.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls))
  }

  if (tweet.includes.media) {
    markdown = markdown.concat(createMediaElements(tweet.includes.media))
  }

  // add extra lines for line breaks in markdown
  markdown = markdown.map(line => line.replace(/\n/g, '\n\n'))

  return frontmatter.concat(markdown).join('\n')
}

// Creates markdown table to capture poll options and votes
const createPollTable = polls => {
  return polls.map(poll => {
    let table = ['|Option|Votes|', `|---|:---:|`]
    let options = poll.options.map(option => `|${option.label}|${option.votes}|`)
    return table.concat(options).join('\n')
  })
}
// Creates markdown image links
const createMediaElements = media => {
  return media.map(medium => {
    switch (medium.type) {
      case "photo":
        return `![${medium.media_key}](${medium.url})`
      default:
        break
    }
  })
}

// Write tweet text to file
const writeTweet = async (tweet, markdown) => {
  let filepath = ''
  // check if path provided by user is valid and writeable
  if (options.path) {
    testPath(options.path)
    filepath = options.path
  }

  // create filename
  let filename = createFilename(tweet)
  // combine name and path
  filepath = path.format({ dir: filepath, base: filename })

  //check if file already exists
  fsp.access(filepath, fs.constants.F_OK).then(_ => {
    if (!options.force) {
      errorMessage(`File already exists. Use --force (-f) to overwrite.`)
    }
  }).catch(error => {
    //file does not exist so we can write to it
  })

  // write the tweet to the file
  await fsp.writeFile(filepath, markdown).catch(error => {
    errorMessage(error)
  })
  console.log(`Tweet saved to ${filepath}`)
}

const createFilename = tweet => {
  if (options.filename) {
    let filename = `${options.filename}.md`
    filename = filename.replace("[[name]]", tweet.includes.users[0].name)
    filename = filename.replace("[[handle]]", tweet.includes.users[0].username)
    filename = filename.replace("[[id]]", tweet.data.id)
    return filename
  }
  return `${tweet.includes.users[0].username} - ${tweet.data.id}.md`
}

// Test if the path exists or is read only
const testPath = async path => {
  await fsp.access(path, fs.constants.F_OK | fs.constants.W_OK)
    .catch(error => {
      errorMessage(`${path} ${error.code === 'ENOENT' ? 'does not exist' : 'is read-only.'}`)
    })
}

const main = async () => {
  let tweet = await getTweet(id)
  let markdown = buildMarkdown(tweet)
  writeTweet(tweet, markdown)
}

main()
