import {server} from 'src/mocks/server'
import {log, writeTweet} from '../src/util'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {processTweetRequest} from 'src/process'
import {
  imageTweet,
  multipleMentionsTweet,
  singleUrlTweet,
  tweetThread,
  tweetWithMissingParent,
} from '__fixtures__/tweets'
import {BEARER_TOKEN} from './consts'
import {japaneseWithHTMLEntitiesTweet} from '__fixtures__/tweets/cjk_tweets'
import {readFile} from 'fs/promises'

vi.mock('../src/util', async () => {
  const original = await vi.importActual<typeof import('../src/util')>(
    '../src/util'
  )
  return {
    ...original,
    log: vi.fn(),
    logErrorToFile: vi.fn(),
    writeTweet: vi.fn(),
  }
})

describe('End to end tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  beforeAll(() => server.listen({onUnhandledRequest: 'error'}))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('Downloads a tweet and generates markdown', async () => {
    const options = {
      src: imageTweet.data.id,
      bearer: BEARER_TOKEN,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/image-tweet.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      imageTweet,
      text.trim(),
      options
    )
  })
  it('Downloads a tweet thread and generates markdown', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: tweetThread[tweetThread.length - 1].data.id,
      thread: true,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/tweet-thread.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      tweetThread[0],
      text.trim(),
      options
    )
  })
  it('Downloads a condensed tweet thread and generates markdown', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: tweetThread[tweetThread.length - 1].data.id,
      condensedThread: true,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/condensed-thread.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      tweetThread[0],
      text.trim(),
      options
    )
  })
  it('Creates a partial markdown file even if thread download fails', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: tweetWithMissingParent.data.id,
      thread: true,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/partial-thread.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      tweetWithMissingParent,
      text.trim(),
      options
    )
    expect(log).toBeCalled()
  })

  it('Properly replaces multiple occurrences of the same mention', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: multipleMentionsTweet.data.id,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/multiple-mentions.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      multipleMentionsTweet,
      text.trim(),
      options
    )
  })
  it('Properly renders tweet with CJK and HTML entities', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: japaneseWithHTMLEntitiesTweet.data.id,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/cjk-html-entities.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      japaneseWithHTMLEntitiesTweet,
      text.trim(),
      options
    )
  })
  it('Does not mangle urls with decoding', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: singleUrlTweet.data.id,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/non-mangled-urls.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(
      singleUrlTweet,
      text.trim(),
      options
    )
  })
  it('Provides just the tweet text with textOnly option', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: singleUrlTweet.data.id,
      textOnly: true,
    }
    await processTweetRequest(options)
    const text = await readFile('__fixtures__/markdown/textonly.md', 'utf-8')
    expect(writeTweet).toBeCalledWith(singleUrlTweet, text.trim(), options)
  })
})
