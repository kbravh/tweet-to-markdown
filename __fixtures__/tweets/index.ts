export * from './cashtag_tweet'
export * from './image_tweet'
export * from './mentions_tweet'
export * from './poll_tweet'
export * from './profile_pic_tweets'
export * from './tweet_thread'

import {Tweet} from 'src/models'
import {cashtagTweet} from './cashtag_tweet'
import {
  imageTweet,
  imageTweetWithAnnotations,
  imageTweetWithAnnotationsAndNewlines,
} from './image_tweet'
import {mentionsTweet, multipleMentionsTweet} from './mentions_tweet'
import {pollTweet} from './poll_tweet'
import {oldProfileTweet, newProfileTweet} from './profile_pic_tweets'
import {tweetThread, tweetWithMissingParent} from './tweet_thread'
export const tweets: Record<string, Tweet> = {
  [cashtagTweet.data.id]: cashtagTweet,
  [imageTweet.data.id]: imageTweet,
  [imageTweetWithAnnotations.data.id]: imageTweetWithAnnotations,
  [imageTweetWithAnnotationsAndNewlines.data.id]:
    imageTweetWithAnnotationsAndNewlines,
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
  [tweetWithMissingParent.data.id]: tweetWithMissingParent,
}
