import axios from 'axios'
import chalk from 'chalk'
import commandLineArgs from 'command-line-args'
import type {ReferencedTweet, Tweet} from './models'
import {
  buildMarkdown,
  copyToClipboard,
  generateErrorMessageFromError,
  getTweet,
  getTweetID,
  log,
  logErrorToFile,
  panic,
  writeTweet,
} from './util'

export const processTweetRequest = async (
  options: commandLineArgs.CommandLineOptions
) => {
  const tweets: Tweet[] = []
  let error: Error
  let currentTweet: Tweet

  // extract tweet ID from URL
  const id = getTweetID(options)

  try {
    currentTweet = await getTweet(id, options.bearer)
  } catch (err) {
    error = err
  }

  !error && tweets.push(currentTweet)
  process.stdout.write(`Tweets downloaded: ${tweets.length}\r`)
  // special handling for threads
  if (
    options.thread ||
    options.condensedThread ||
    options.semicondensedThread
  ) {
    // check if this is the head tweet
    while (currentTweet?.data?.conversation_id !== currentTweet?.data?.id) {
      // load in parent tweet
      const [parent_tweet] = currentTweet.data.referenced_tweets.filter(
        (ref_tweet: ReferencedTweet) => ref_tweet.type === 'replied_to'
      )
      try {
        currentTweet = await getTweet(parent_tweet.id, options.bearer)
      } catch (err) {
        error = err
        break
      }
      tweets.push(currentTweet)
      process.stdout.write(`Tweets downloaded: ${tweets.length}\r`)
    }
  }
  if (error) {
    const message = generateErrorMessageFromError(error)
    await logErrorToFile(message)
  }

  if (error && !tweets.length) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        panic(chalk.red(error.response.statusText))
      } else if (error.request) {
        panic(chalk.red('There seems to be a connection issue.'))
      } else {
        panic(chalk.red('An error occurred.'))
      }
    }
    panic(
      chalk`{red Unfortunately, an error occurred.} See ttm.log in this directory file for details.`
    )
  }

  if (error && tweets.length) {
    log(
      chalk`{red An error occurred while downloading tweets.} I'll generate your markdown file with the information I did fetch.\nSee ttm.log in this directory file for details.`
    )
  }
  // reverse the thread so the tweets are in chronological order
  tweets.reverse()
  const markdowns = await Promise.all(
    tweets.map(async (tweet, index) => {
      return await buildMarkdown(
        tweet,
        options,
        index === 0 ? 'normal' : 'thread',
        index === 0 ? null : tweets[index - 1].includes.users[0]
      )
    })
  )
  const firstTweet = tweets[0]
  if (
    (options.condensedThread || options.semicondensedThread) &&
    !options.textOnly
  ) {
    markdowns.push(
      `\n\n[Thread link](https://twitter.com/${firstTweet.includes.users[0].username}/status/${firstTweet.data.id})`
    )
  }

  const final =
    options.condensedThread
      ? markdowns.join('\n\n')
      : markdowns.join('\n\n---\n\n')

  if (options.clipboard) {
    copyToClipboard(final)
  } else {
    writeTweet(firstTweet, final, options)
  }
}
