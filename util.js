const { default: Axios } = require("axios")
const clipboard = require(`clipboardy`)
const log = () => {}
const panic = () => {throw new Error}

/**
 * Parses out the tweet ID from the URL or ID that the user provided
 * @param {options} options - The parsed command line arguments
 */
const getTweetID = ({src}) => {
  let id
  try {
    // Create a URL object with the source. If it fails, it's not a URL.
    let url = new URL(src)
    id = url.pathname.split('/').slice(-1)[0]
  } catch (error) {
    id = src
  }
  return id
}

// fetch tweet from Twitter API
/**
 * Fetches a tweet object from the Twitter v2 API
 * @param {string} id - The ID of the tweet to fetch from the API
 */
const getTweet = async (id, bearer) => {
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
        panic(chalk.red(error.response.statusText))
      } else if (error.request) {
        panic(chalk.red(`There seems to be a connection issue.`))
      } else {
        panic(chalk.red(`An error occurred.`))
      }
    })
}

/**
 * Copies the provided string to the clipboard.
 * @param {string} markdown - The markdown to be copied to the clipboard
 */
const copyToClipboard = async markdown => {
  await clipboard.write(markdown)
    .catch(error => {
      panic(chalk`{red There was a problem writing to the clipboard.}`)
    })
  log(`Tweet copied to the clipboard.`)
}

/**
 * Creates markdown table to capture poll options and votes
 * @param {polls} polls - The polls object provided by the Twitter v2 API
 */
const createPollTable = polls => {
  return polls.map(poll => {
    let table = ['\n|Option|Votes|', `|---|:---:|`]
    let options = poll.options.map(option => `|${option.label}|${option.votes}|`)
    return table.concat(options).join('\n')
  })
}

module.exports = {
  getTweetID,
  getTweet,
  copyToClipboard,
  createPollTable
}