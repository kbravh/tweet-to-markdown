const { default: Axios } = require(`axios`)
const axiosRetry = require(`axios-retry`)
const clipboard = require(`clipboardy`)
const log = console.log
const fs = require(`fs`)
const path = require(`path`)
const fsp = fs.promises
const chalk = require(`chalk`)
const URL = require(`url`).URL

axiosRetry(Axios, {retries: 3})

/**
 * Displays an error message to the user, then exits the program with a failure code.
 * @param {string} message - The error message to be displayed to the user
 */
const panic = message => {
  log(message)
  process.exit(1)
}

/**
 * Download the remote image url to the local path.
 * @param {string} url - The remote image URL to download
 * @param {string} image_path - The local path to save the image
 */
const downloadImage = (url, image_path) =>
  Axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );

/**
 * Parses out the tweet ID from the URL or ID that the user provided
 * @param {options} options - The parsed command line arguments
 */
const getTweetID = ({ src }) => {
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
 * @param {string} bearer - The bearer token 
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
    .then(tweet => {
      if (tweet.errors) {
        panic(chalk`{red ${tweet.errors[0].detail}}`)
      } else {
        return tweet
      }
    })
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

/**
 * Creates a filename based on the tweet and the user defined options.
 * @param {tweet} tweet - The entire tweet object from the Twitter v2 API
 */
const createFilename = (tweet, options) => {
  if (options.filename) {
    let filename = `${options.filename}.md`
    filename = filename.replace("[[name]]", tweet.includes.users[0].name)
    filename = filename.replace("[[handle]]", tweet.includes.users[0].username)
    filename = filename.replace("[[id]]", tweet.data.id)
    return filename
  }
  return `${tweet.includes.users[0].username} - ${tweet.data.id}.md`
}

/**
 * Creates media links to embed media into the markdown file
 * @param {media} media - The tweet media object provided by the Twitter v2 API
 */
const createMediaElements = (media, options) => {
  // If the user wants to download assets locally, we'll need to define the path
  let localAssetPath = options.assetsPath ? options.assetsPath : './tweet-assets'
  // we need the relative path to the assets from the notes
  let relativeAssetPath = path.relative(options.path ? options.path : `.`, localAssetPath)
  return media.map(medium => {
    switch (medium.type) {
      case "photo":
        return options.assets 
        ? `\n![${medium.media_key}](${path.join(relativeAssetPath, `${medium.media_key}.jpg`)})`
        : `\n![${medium.media_key}](${medium.url})`
      default:
        break
    }
  })
}

/**
 * Tests if a path exists and if the user has write permission.
 * @param {string} path - the path to test for access
 */
const testPath = async path => {
  await fsp.access(path, fs.constants.F_OK | fs.constants.W_OK)
    .catch(error => {
      util.panic(chalk`{red The path {bold {underline ${path}}} ${error.code === 'ENOENT' ? 'does not exist.' : 'is read-only.'}}`)
    })
}

/**
 * 
 * @param {tweet} tweet - The entire tweet object provided by the Twitter v2 API
 * @param {options} options - The parsed command line arguments
 */
const buildMarkdown = async (tweet, options) => {
  let metrics = []
  if (options.metrics) {
    metrics = [
      `likes: ${tweet.data.public_metrics.like_count}`,
      `retweets: ${tweet.data.public_metrics.retweet_count}`,
      `replies: ${tweet.data.public_metrics.reply_count}`
    ]
  }

  let text = tweet.data.text
  let user = tweet.includes.users[0]

  /**
   * replace entities with markdown links
   */
  if (tweet.data.entities) {
    /**
     * replace any mentions, hashtags, cashtags, urls with links
     */
    tweet.data.entities.mentions && tweet.data.entities.mentions.forEach(({ username }) => {
      text = text.replace(`@${username}`, `[@${username}](https://twitter.com/${username})`)
    })
    tweet.data.entities.hashtags && tweet.data.entities.hashtags.forEach(({ tag }) => {
      text = text.replace(`#${tag}`, `[#${tag}](https://twitter.com/hashtag/${tag}) `)
    })
    tweet.data.entities.cashtags && tweet.data.entities.cashtags.forEach(({ tag }) => {
      text = text.replace(`$${tag}`, `[$${tag}](https://twitter.com/search?q=%24${tag})`)
    })
    tweet.data.entities.urls && tweet.data.entities.urls.forEach(url => {
      text = text.replace(url.url, `[${url.display_url}](${url.expanded_url})`)
    })
  }

  /**
   * Define the frontmatter as the name and handle
   */
  let frontmatter = [
    `---`,
    `author: ${user.name}`,
    `handle: @${user.username}`,
    ...metrics,
    `---`
  ]

  // if the user wants local assets, download them
  if (options.assets) {
    await downloadAssets(tweet, options)
  }

  let markdown = [
    `![${user.username}](${user.profile_image_url})`, // profile image
    `${user.name} ([@${user.username}](https://twitter.com/${user.username}))`, // name and handle
    `\n`,
    `${text}` // text of the tweet
  ]

  // markdown requires 2 line breaks for actual new lines
  markdown = markdown.map(line => line.replace(/\n/g, '\n\n'))

  // Add in other tweet elements
  if (tweet.includes.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls))
  }

  if (tweet.includes.media) {
    markdown = markdown.concat(createMediaElements(tweet.includes.media, options))
  }

  return frontmatter.concat(markdown).join('\n')
}

const downloadAssets = async (tweet, options) => {
    let user = tweet.includes.users[0]
    // determine path to download local assets
    let localAssetPath = options.assetsPath ? options.assetsPath : './tweet-assets'
    // create this directory if it doesn't yet exist
    fsp.mkdir(localAssetPath, { recursive: true }).catch(error => {
      panic(chalk`{red The path {bold {underline ${localAssetPath}}} is read-only.}`)
    })

    // grab a list of all files to download and their paths
    let files = []
    // add profile image to download list
    files.push({
      url: user.profile_image_url,
      path: path.join(localAssetPath, `${user.username}-${user.id}.jpg`)
    })

    // add tweet images to download list
    if (tweet.includes.media) {
      tweet.includes.media.forEach(medium => {
        switch (medium.type) {
          case "photo":
            files.push({
              url: medium.url,
              path: path.join(localAssetPath, `${medium.media_key}.jpg`)
            })
          default:
            break
        }
      })
    }

    /**
     * Filter out tweet assets that already exist locally.
     * Array.filter() is only synchronous, so we can't use it here.
     */
    // Determine which assets do exist
    let assetTests = await asyncMap(files, ({path}) => doesFileExist(path))
    // Invert the test results to know which don't exist
    assetTests = assetTests.map(result => !result)
    // filter the list of assets to download
    files = files.filter((_, index) => assetTests[index])

    // Download missing assets
    return Promise.all(files.map(file => downloadImage(file.url, file.path)))
}

const asyncMap = async (array, mutator) => Promise.all(array.map(element => mutator(element)))

const doesFileExist = filepath => fsp.access(filepath, fs.constants.F_OK).then(_ => true).catch(_ => false)

module.exports = {
  getTweetID,
  getTweet,
  copyToClipboard,
  createPollTable,
  createFilename,
  createMediaElements,
  panic,
  testPath,
  buildMarkdown,
  asyncMap,
  doesFileExist
}