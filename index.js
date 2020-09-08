#!/usr/bin/env node

const { default: Axios } = require("axios")
const commandLineArgs = require(`command-line-args`)
const fs = require(`fs`)
const fsp = fs.promises
const path = require(`path`)

const errorMessage = message => {
  console.error(message)
  process.exit(1)
}

const optionDefinitions = [
  { name: `src`, defaultOption: true },
  { name: `bearer`, alias: `b` },
  { name: `path`, alias: `p`}
]

const options = commandLineArgs(optionDefinitions)

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
    "tweet.fields": "attachments",
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
  let frontmatter = [
    `---`,
    `author: ${tweet.includes.users[0].name}`,
    `handle: @${tweet.includes.users[0].username}`,
    `---`
  ]

  let markdown = [
    `![${tweet.includes.users[0].username}](${tweet.includes.users[0].profile_image_url})`, // profile image
    `${tweet.includes.users[0].name} (@${tweet.includes.users[0].username})`,
    `\n`,
    `${tweet.data.text}`
  ]

  // Add in other tweet elements
  if (tweet.includes.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls))
  }

  if (tweet.includes.media) {
    markdown = markdown.concat(createMediaElements(tweet.includes.media))
  }

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

const createMediaElements = media => {
  return media.map(medium => {
    switch(medium.type){
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
  if(options.path){
    testPath(options.path)
    filepath = options.path
  }

  let filename = `${tweet.includes.users[0].username} - ${tweet.data.id}.md`
  filepath = path.format({dir: filepath, base: filename})

  await fsp.writeFile(filepath, markdown).catch(error => {
    errorMessage(error)
  })
  console.log(`Tweet saved to ${filepath}`)
}

const testPath = async path => {
  await fsp.access(path, fs.constants.F_OK | fs.constants.W_OK)
    .catch(error => {
      errorMessage(`${path} ${error.code === 'ENOENT' ? 'does not exist' : 'is read-only.'}`)
    })
  // if we made it past the check, return true
  return true
}

const main = async () => {
  let tweet = await getTweet(id)
  let markdown = buildMarkdown(tweet)
  writeTweet(tweet, markdown)
}

main()
