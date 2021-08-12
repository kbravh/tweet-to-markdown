const { default: Axios } = require(`axios`);
const axiosRetry = require(`axios-retry`);
const clipboard = require(`clipboardy`);
const log = console.info;
const fs = require(`fs`);
const path = require(`path`);
const fsp = fs.promises;
const chalk = require(`chalk`);
const URL = require(`url`).URL;

axiosRetry(Axios, { retries: 3 });

/**
 * Displays an error message to the user, then exits the program with a failure code.
 * @param {string} message - The error message to be displayed to the user
 */
const panic = (message) => {
  log(message);
  process.exit(1);
};

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
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', (e) => reject(e));
      }),
  );

/**
 * Parses out the tweet ID from the URL or ID that the user provided
 * @param {Object} options - The parsed command line arguments
 */
const getTweetID = ({ src }) => {
  let id;
  try {
    // Create a URL object with the source. If it fails, it's not a URL.
    let url = new URL(src);
    id = url.pathname.split('/').slice(-1)[0];
  } catch (error) {
    id = src;
  }
  return id;
};

// fetch tweet from Twitter API
/**
 * Fetches a tweet object from the Twitter v2 API
 * @param {string} id - The ID of the tweet to fetch from the API
 * @param {string} bearer - The bearer token
 */
const getTweet = async (id, bearer) => {
  let twitterUrl = new URL(`https://api.twitter.com/2/tweets/${id}`);
  let params = new URLSearchParams({
    expansions: 'author_id,attachments.poll_ids,attachments.media_keys',
    'user.fields': 'name,username,profile_image_url',
    'tweet.fields': 'attachments,public_metrics,entities,conversation_id,referenced_tweets',
    'media.fields': 'url',
    'poll.fields': 'options',
  });

  return await Axios({
    method: `GET`,
    url: `${twitterUrl.href}?${params.toString()}`,
    headers: { Authorization: `Bearer ${bearer}` },
  })
    .then((response) => response.data)
    .then((tweet) => {
      if (tweet.errors) {
        panic(chalk`{red ${tweet.errors[0].detail}}`);
      } else {
        return tweet;
      }
    })
    .catch((error) => {
      if (error.response) {
        panic(chalk.red(error.response.statusText));
      } else if (error.request) {
        panic(chalk.red(`There seems to be a connection issue.`));
      } else {
        panic(chalk.red(`An error occurred.`));
      }
    });
};

/**
 * Copies the provided string to the clipboard.
 * @param {string} markdown - The markdown to be copied to the clipboard
 */
const copyToClipboard = async (markdown) => {
  await clipboard.write(markdown).catch((error) => {
    panic(chalk`{red There was a problem writing to the clipboard.}`);
  });
  log(`Tweet copied to the clipboard.`);
};

/**
 * A tweet poll
 * @typedef {Object} Poll
 * @property {string} id - The ID
 * @property {Object[]} options - The poll choices
 * @property {number} options.position - The rank of the choice
 * @property {string} options.label - The text of the choice
 * @property {number} options.votes - The number of votes the choice received
*/

/**
 * Creates markdown table to capture poll options and votes
 * @param {Poll[]} polls - The polls array provided by the Twitter v2 API
 * @returns {string} - Markdown table as a string of the poll
 */
const createPollTable = (polls) => {
  return polls.map((poll) => {
    let table = ['\n|Option|Votes|', `|---|:---:|`];
    let options = poll.options.map((option) => `|${option.label}|${option.votes}|`);
    return table.concat(options).join('\n');
  });
};

/**
 * A tweet
 * @typedef {Object} Tweet
 * @property {Object} includes - Attachments, users, and other data
 * @property {Poll[]} includes.polls - The polls from the tweet
 * @property {Object[]} includes.users - The tweet users
 * @property {string} includes.users.name - The user's name
 * @property {string} includes.users.id - The user's ID
 * @property {string} includes.users.username - The user's username
 * @property {string} includes.users.profile_image_url - The user's profile image url
 * @property {Object[]} includes.media - The attached media objects
 * @property {string} includes.media.media_key - The unique ID of the media object
 * @property {("photo" | "gif" | "video")} includes.media.type - The type of attachment
 * @property {string} includes.media.url - The URL of the media object
 * @property {Object} data - Tweet metadata
 * @property {Object} data.attachments - Attachment IDs
 * @property {string[]} data.attachments.poll_ids - Poll IDs
 * @property {string[]} data.attachments.media_keys - The IDs of the media objects
 * @property {Object} data.public_metrics - Tweet metrics
 * @property {number} data.public_metrics.retweet_count - The number of retweets
 * @property {number} data.public_metrics.reply_count - The number of replies
 * @property {number} data.public_metrics.like_count - The number of likes
 * @property {number} data.public_metrics.quote_count - The number of quotes
 * @property {string} data.id - The tweet id
 * @property {string} data.text - The tweet text
 * @property {string} data.author_id - The author's ID
 * @property {Object} data.entities - Tags and links in the tweet
 * @property {Object[]} data.entities.urls - URLs included in the tweet
 * @property {number} data.entitites.urls.start - The starting index of the URL
 * @property {number} data.entitites.urls.end - The ending index of the URL
 * @property {string} data.entitites.urls.url - The shortened URL
 * @property {string} data.entitites.urls.expanded_url - The full URL
 * @property {string} data.entitites.urls.display_url - The displayed URL
 * @property {Object[]} data.entities.mentions - Other users mentioned
 * @property {string} data.entitites.mentions.start - The starting index of the mention
 * @property {string} data.entitites.mentions.end - The ending index of the mention
 * @property {string} data.entitites.mentions.username - The handle of the mention
 * @property {Object[]} data.entities.annotations - Recognized objects in the tweet text
 * @property {number} data.entities.annotations.start - The starting index of the annotation
 * @property {number} data.entities.annotations.end - The ending index of the annotation
 * @property {number} data.entities.annotations.probability - The probability of a correct annotation recognition
 * @property {("Person" | "Place" | "Product" | "Organization" | "Other")} data.entities.annotations.type - The type of annotation
 * @property {string} data.entities.annotations.normalized_text - The normalized title of the annotation
 * @property {Object[]} data.entities.hashtags - The hashtags in the tweet
 * @property {number} data.entities.hashtags.start - The starting index of the hashtag
 * @property {number} data.entities.hashtags.end - The ending index of the hashtag
 * @property {number} data.entities.hashtags.tag - The tag itself
 * @property {Object[]} data.entities.cashtags - The cashtags in the tweet
 * @property {number} data.entities.cashtags.start - The starting index of the cashtag
 * @property {number} data.entities.cashtags.end - The ending index of the cashtag
 * @property {number} data.entities.cashtags.tag - The tag itself
 * @property {Object[]} data.referenced_tweets - Tweets referenced by this tweet
 * @property {("quoted" | "replied_to")} data.referenced_tweets.type - The type of tweet reference
 * @property {string} data.referenced_tweets.id - The referenced tweet's ID
 * @property {string} data.author_id - The author's tweet
 * @property {string} data.conversation_id - The ID of the first tweet in the conversation
 */

/**
 * Creates a filename based on the tweet and the user defined options.
 * @param {Tweet} tweet - The entire tweet object from the Twitter v2 API
 * @param {Object} options - The parsed command line arguments
 * @returns {string} - The filename based on tweet and options
 */
const createFilename = (tweet, options) => {
  if (options.filename) {
    let filename = `${options.filename}.md`;
    filename = filename.replace('[[name]]', tweet.includes.users[0].name);
    filename = filename.replace('[[handle]]', tweet.includes.users[0].username);
    filename = filename.replace('[[id]]', tweet.data.id);
    return filename;
  }
  return `${tweet.includes.users[0].username} - ${tweet.data.id}.md`;
};

/**
 * Returns the local path to the asset, taking into account the path
 * for the tweet itself so that the asset path is relative.
 * @param {Object} options - The parsed command line arguments
 * @returns {string} - The local asset path
 */
getLocalAssetPath = (options) => {
  // If the user wants to download assets locally, we'll need to define the path
  let localAssetPath = options.assetsPath ? options.assetsPath : './tweet-assets';
  // we need the relative path to the assets from the notes
  return path.relative(options.path ? options.path : `.`, localAssetPath);
};

/**
 * Creates media links to embed media into the markdown file
 * @param {Object} media - The tweet media object provided by the Twitter v2 API
 * @returns {string[]} - An array of markdown image links
 */
const createMediaElements = (media, options) => {
  let localAssetPath = getLocalAssetPath(options);
  return media.map((medium) => {
    switch (medium.type) {
      case 'photo':
        return options.assets ? `\n![${medium.media_key}](${path.join(localAssetPath, `${medium.media_key}.jpg`)})` : `\n![${medium.media_key}](${medium.url})`;
      default:
        break;
    }
  });
};

/**
 * Tests if a path exists and if the user has write permission.
 * @param {string} path - the path to test for access
 */
const testPath = async (path) =>
  fsp.mkdir(path, { recursive: true }).catch((error) => {
    panic(chalk`{red Unable to write to the path {bold {underline ${path}}}. Do you have write permission?}`);
  });

/**
 * Creates the entire Markdown string of the provided tweet
 * @param {Tweet} tweet - The entire tweet object provided by the Twitter v2 API
 * @param {Object} options - The parsed command line arguments
 * @param {("normal" | "thread" | "quoted")} type - Whether this is a normal, thread, or quoted tweet
 * @returns {string} - The Markdown string of the tweet
 */
const buildMarkdown = async (tweet, options, type = 'normal') => {
  let metrics = [];
  if (options.metrics) {
    metrics = [`likes: ${tweet.data.public_metrics.like_count}`, `retweets: ${tweet.data.public_metrics.retweet_count}`, `replies: ${tweet.data.public_metrics.reply_count}`];
  }

  let text = tweet.data.text;
  let user = tweet.includes.users[0];

  /**
   * replace entities with markdown links
   */
  if (tweet.data.entities) {
    /**
     * replace any mentions, hashtags, cashtags, urls with links
     */
    tweet.data.entities.mentions &&
      tweet.data.entities.mentions.forEach(({ username }) => {
        text = text.replace(`@${username}`, `[@${username}](https://twitter.com/${username})`);
      });
    tweet.data.entities.hashtags &&
      tweet.data.entities.hashtags.forEach(({ tag }) => {
        text = text.replace(`#${tag}`, `[#${tag}](https://twitter.com/hashtag/${tag}) `);
      });
    tweet.data.entities.cashtags &&
      tweet.data.entities.cashtags.forEach(({ tag }) => {
        text = text.replace(`$${tag}`, `[$${tag}](https://twitter.com/search?q=%24${tag})`);
      });
    tweet.data.entities.urls &&
      tweet.data.entities.urls.forEach((url) => {
        text = text.replace(url.url, `[${url.display_url}](${url.expanded_url})`);
      });
  }

  /**
   * Define the frontmatter as the name, handle, and source url
   */
  let frontmatter = [`---`, `author: ${user.name}`, `handle: @${user.username}`, `source: https://twitter.com/${user.username}/status/${tweet.data.id}`, ...metrics, `---`];

  // if the user wants local assets, download them
  if (options.assets) {
    await downloadAssets(tweet, options);
  }

  let markdown = [
    `![${user.username}](${options.assets ? path.join(getLocalAssetPath(options), `${user.username}-${user.id}.jpg`) : user.profile_image_url})`, // profile image
    `${user.name} ([@${user.username}](https://twitter.com/${user.username}))`, // name and handle
    `\n`,
    `${text}`, // text of the tweet
  ];

  // markdown requires 2 line breaks for actual new lines
  markdown = markdown.map((line) => line.replace(/\n/g, '\n\n'));

  // Add in other tweet elements
  if (tweet.includes.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls));
  }

  if (tweet.includes.media) {
    markdown = markdown.concat(createMediaElements(tweet.includes.media, options));
  }

  // check for quoted tweets to be included
  if (options.quoted && tweet.data && tweet.data.referenced_tweets) {
    for (const subtweet_ref of tweet.data.referenced_tweets) {
      if (subtweet_ref && subtweet_ref.type === 'quoted') {
        let subtweet = await getTweet(subtweet_ref.id, options.bearer);
        let subtweet_text = await buildMarkdown(subtweet, options, 'quoted');
        markdown.push('\n\n' + subtweet_text);
      }
    }
  }

  // indent all lines for a quoted tweet
  if (type === 'quoted') {
    markdown = markdown.map((line) => '> ' + line);
  }

  if (type === 'normal') {
    return frontmatter.concat(markdown).join('\n');
  } else {
    return "\n\n" + markdown.join('\n');
  }
};

/**
 * Downloads all tweet images locally if they do not yet exist
 * @param {Tweet} tweet - The entire tweet object from the twitter API
 * @param {Object} options - The command line options
 */
const downloadAssets = async (tweet, options) => {
  let user = tweet.includes.users[0];
  // determine path to download local assets
  let localAssetPath = options.assetsPath ? options.assetsPath : './tweet-assets';
  // create this directory if it doesn't yet exist
  await testPath(localAssetPath);

  // grab a list of all files to download and their paths
  let files = [];
  // add profile image to download list
  files.push({
    url: user.profile_image_url,
    path: path.join(localAssetPath, `${user.username}-${user.id}.jpg`),
  });

  // add tweet images to download list
  if (tweet.includes.media) {
    tweet.includes.media.forEach((medium) => {
      switch (medium.type) {
        case 'photo':
          files.push({
            url: medium.url,
            path: path.join(localAssetPath, `${medium.media_key}.jpg`),
          });
        default:
          break;
      }
    });
  }

  /**
   * Filter out tweet assets that already exist locally.
   * Array.filter() is only synchronous, so we can't use it here.
   */
  // Determine which assets do exist
  let assetTests = await asyncMap(files, ({ path }) => doesFileExist(path));
  // Invert the test results to know which don't exist
  assetTests = assetTests.map((result) => !result);
  // filter the list of assets to download
  files = files.filter((_, index) => assetTests[index]);

  // Download missing assets
  return Promise.all(files.map((file) => downloadImage(file.url, file.path)));
};

/**
 * An async version of the Array.map() function.
 * @param {*[]} array - The array to be mapped over
 * @param {Function} mutator - The function to apply to every array element
 * @returns {Promise} - A Promise that resolves to the mapped array values
 */
const asyncMap = async (array, mutator) => Promise.all(array.map((element) => mutator(element)));

/**
 * Determines if a file exists locally.
 * @param {String} filepath - The filepath to test
 * @returns {Boolean} - True if file exists, false otherwise
 */
const doesFileExist = (filepath) =>
  fsp
    .access(filepath, fs.constants.F_OK)
    .then((_) => true)
    .catch((_) => false);

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
  doesFileExist,
};
