/**
 * A tweet
 * @typedef {Object} Tweet
 * @property {Object} includes - Attachments, users, and other data
 * @property {Poll[]} includes.polls - The polls from the tweet
 * @property {User[]} includes.users - The tweet users
 * @property {Media[]} includes.media - The attached media objects
 * @property {Data} data - Tweet metadata
 * @property {Entities} data.entities - Tags and links in the tweet
 */

/**
 * Tweet metadata
 * @typedef {Object} Data
 * @property {string} id - The tweet id
 * @property {string} text - The tweet text
 * @property {string} author_id - The author's ID
 * @property {string} conversation_id - The ID of the first tweet in the conversation
 * @property {Attachments} data.attachments - Attachment IDs
 * @property {Metrics} data.public_metrics - Tweet metrics
 */

/**
 * Entities included in the tweet object
 * @typedef {Object} Entities
 * @property {URL[]} urls - URLs included in the tweet
 * @property {Mention[]} mentions - Other users mentioned
 * @property {Annotation[]} annotations - Recognized objects in the tweet text
 * @property {Tag[]} hashtags - The hashtags in the tweet
 * @property {Tag[]} cashtags - The cashtags in the tweet
 * @property {ReferencedTweet[]} referenced_tweets - Tweets referenced by this tweet
 */

/**
 * A tweet annotation
 * @typedef {Object} Annotation
 * @property {number} start - The starting index of the annotation
 * @property {number} end - The ending index of the annotation
 * @property {number} probability - The probability of a correct annotation recognition
 * @property {("Person" | "Place" | "Product" | "Organization" | "Other")} type - The type of annotation
 * @property {string} normalized_text - The normalized title of the annotation
 */

/**
 * Metadata about attachments
 * @typedef {Object} Attachments
 * @property {string[]} poll_ids - Poll IDs
 * @property {string[]} media_keys - The IDs of the media objects
 */

/**
 * A tweet media object
 * @typedef {Object} Media
 * @property {string} media_key - The unique ID of the media object
 * @property {("photo" | "gif" | "video")} type - The type of attachment
 * @property {string} url - The URL of the media object
 */

/**
 * A tweet mention
 * @typedef {Object} Mention
 * @property {string} start - The starting index of the mention
 * @property {string} end - The ending index of the mention
 * @property {string} username - The handle of the mention
 */

/**
 * Tweet metrics
 * @typedef {Object} Metrics
 * @property {number} retweet_count - The number of retweets
 * @property {number} reply_count - The number of replies
 * @property {number} like_count - The number of likes
 * @property {number} quote_count - The number of quotes
 */

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
 * A tweet that was referenced
 * @typedef {Object} ReferencedTweet
 * @property {("quoted" | "replied_to")} type - The type of tweet reference
 * @property {string} id - The referenced tweet's ID
 */

/**
 * A tweet tag, such as a hashtag or cashtag
 * @typedef {Object} Tag
 * @property {number} start - The starting index of the tag
 * @property {number} end - The ending index of the tag
 * @property {number} tag - The tag itself
 */

/**
 * A URL
 * @typedef {Object} URL
 * @property {number} start - The starting index of the URL
 * @property {number} end - The ending index of the URL
 * @property {string} url - The shortened URL
 * @property {string} expanded_url - The full URL
 * @property {string} display_url - The displayed URL
 */

/**
 * A tweet user
 * @typedef {Object} User
 * @property {string} name - The user's name
 * @property {string} id - The user's ID
 * @property {string} username - The user's username
 * @property {string} profile_image_url - The user's profile image url
 */

exports.types = {}
