#!/usr/bin/env node

const { default: Axios } = require("axios")
const commandLineArgs = require(`command-line-args`)
const fs = require(`fs`).promises

const errorMessage = message => {
  console.error(message)
  process.exit(1)
}

const optionDefinitions = [
  { name: `src`, defaultOption: true },
  { name: `bearer`, alias: `b` }
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
    "expansions": "author_id",
    "user.fields": "name,username,profile_image_url"
  })

  return await Axios({
    method: `GET`,
    url: `${twitterUrl.href}?${params.toString()}`,
    headers: { 'Authorization': `Bearer ${bearer}` }
  })
    .then(response => response.data)
    .catch(error => {
      if (error.response) {
        console.log(error.response)
        errorMessage(error.response.statusText)
      } else if (error.request) {
        console.log(error.request)
        errorMessage(`There seems to be a connection issue.`)
      } else {
        console.error(JSON.stringify(error, null, 2))
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

  return frontmatter.concat(markdown).join('\n')
}

// Write tweet text to file
const writeTweet = async (tweet, markdown) => {
  let filename = `${tweet.includes.users[0].username} - ${tweet.data.id}.md`
  await fs.writeFile(filename, markdown, error => {
    if (error) throw error
    console.log(`Tweet saved to ${filename}`)
  })
}

const main = async () => {
  let tweet = await getTweet(id)
  let markdown = buildMarkdown(tweet)
  writeTweet(tweet, markdown)
}

main()
