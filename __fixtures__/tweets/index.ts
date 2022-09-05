export * from './cashtag_tweet'
export * from './cjk_tweets'
export * from './emoji_tweets'
export * from './image_tweet'
export * from './mentions_tweet'
export * from './poll_tweet'
export * from './profile_pic_tweets'
export * from './tweet_thread'
export * from './url_tweet'

import {Tweet} from 'src/models'
import {cashtagTweet} from './cashtag_tweet'
import {japaneseWithHTMLEntitiesTweet, koreanTweet} from './cjk_tweets'
import {
  imageTweet,
  imageTweetWithAnnotations,
  imageTweetWithAnnotationsAndNewlines,
} from './image_tweet'
import {mentionsTweet, multipleMentionsTweet} from './mentions_tweet'
import {pollTweet} from './poll_tweet'
import {oldProfileTweet, newProfileTweet} from './profile_pic_tweets'
import {tweetThread, tweetWithMissingParent} from './tweet_thread'
import {singleUrlTweet} from './url_tweet'
export const tweets: Record<string, Tweet> = {
  [cashtagTweet.data.id]: cashtagTweet,
  [koreanTweet.data.id]: koreanTweet,
  [imageTweet.data.id]: imageTweet,
  [imageTweetWithAnnotations.data.id]: imageTweetWithAnnotations,
  [imageTweetWithAnnotationsAndNewlines.data.id]:
    imageTweetWithAnnotationsAndNewlines,
  [japaneseWithHTMLEntitiesTweet.data.id]: japaneseWithHTMLEntitiesTweet,
  [mentionsTweet.data.id]: mentionsTweet,
  [multipleMentionsTweet.data.id]: multipleMentionsTweet,
  [pollTweet.data.id]: pollTweet,
  [oldProfileTweet.data.id]: oldProfileTweet,
  [newProfileTweet.data.id]: newProfileTweet,
  ...tweetThread.reduce(
    (tweets, tweet) => ({
      ...tweets,
      [tweet.data.id]: tweet,
    }),
    {}
  ),
  [singleUrlTweet.data.id]: singleUrlTweet,
  [tweetWithMissingParent.data.id]: tweetWithMissingParent,
}
