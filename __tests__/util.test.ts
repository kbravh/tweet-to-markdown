import {
  createFilename,
  createMediaElements,
  createPollTable,
  getLocalAssetPath,
  getTweet,
  getTweetID,
  replaceEntities,
  sanitizeFilename,
  truncateBytewise,
} from 'src/util'
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest'
import {
  imageTweet,
  imageTweetWithAnnotations,
  pollTweet,
} from '../__fixtures__/tweets'
import {BEARER_TOKEN} from './consts'
import {server} from 'src/mocks/server'
import {platform} from 'os'

describe('Tweet download functions', () => {
  it('Extracts tweet Id from regular URL', async () => {
    expect(
      getTweetID({
        src: 'https://twitter.com/whataweekhuh/status/1511656964538916868',
      })
    ).toBe('1511656964538916868')
  })
  it('Extracts tweet Id from URL with query params', async () => {
    expect(
      getTweetID({
        src: 'https://twitter.com/whataweekhuh/status/1511656964538916868?s=20&t=tbYKVygf0nKOlvn4CpyKYw',
      })
    ).toBe('1511656964538916868')
  })
  it('returns the id if not a url', () => {
    expect(getTweetID({src: '1556128943861899264'})).toBe('1556128943861899264')
  })

  describe('Downloads tweets', () => {
    beforeAll(() => server.listen({onUnhandledRequest: 'error'}))
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
    it('Downloads tweet from ttm', async () => {
      await expect(
        getTweet(imageTweet.data.id, BEARER_TOKEN)
      ).resolves.toStrictEqual(imageTweet)
    })
  })
})

describe('Tweet construction functions', () => {
  it('Creates a poll table', () => {
    expect(createPollTable(pollTweet.includes.polls)).toStrictEqual([
      `
|Option|Votes|
|---|:---:|
|Spring|1373|
|Fall|3054|`,
    ])
  })

  it('Creates photo media elements for linked assets', () => {
    expect(createMediaElements(imageTweet.includes.media, {})).toStrictEqual([
      '\n![](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)',
      '\n![](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)',
    ])
  })
  it('Creates photo media elements for local assets', () => {
    expect(
      createMediaElements(imageTweet.includes.media, {assets: true})
    ).toStrictEqual(
      platform() === 'win32'
        ? [
            '\n![](tweet-assets\\3_1292845624120025090.jpg)',
            '\n![](tweet-assets\\3_1292845644567269376.jpg)',
          ]
        : [
            '\n![](tweet-assets/3_1292845624120025090.jpg)',
            '\n![](tweet-assets/3_1292845644567269376.jpg)',
          ]
    )
  })
  it('Creates photo media elements with alt text', () => {
    expect(
      createMediaElements(imageTweetWithAnnotations.includes.media, {})
    ).toStrictEqual([
      '\n![Joel smashing burgers.](https://pbs.twimg.com/media/FZmlwT7UIAEql9P.jpg)',
      '\n![Smash burgers with white onions smashed into the top side.](https://pbs.twimg.com/media/FZmlwT8UcAAotNc.jpg)',
      '\n![Smash burgers in the process of being flipped. There are onions on the griddle side of the patties and a serious crust on the top.](https://pbs.twimg.com/media/FZmlwUOUIAAl41A.jpg)',
    ])
  })
})

describe('Filename functions', () => {
  it('Truncates a string to a specified byte length', () => {
    expect(truncateBytewise('😎 truncate me down', 10)).toBe('😎 trunc')
  })
  it('Sanitizes filename', () => {
    expect(sanitizeFilename('Illegal:<> Filename*')).toBe('Illegal Filename')
  })

  it('Defaults to "handle - id" if no pattern provided', () => {
    expect(createFilename(imageTweet, {})).toBe(
      'Mappletons - 1292845757297557505.md'
    )
  })
  it('Sanitizes unsafe filename characters', () => {
    expect(createFilename(imageTweet, {filename: '?<>hello:*|"'})).toBe(
      'hello.md'
    )
  })
  it('Sanitizes slashes from filename', () => {
    expect(createFilename(imageTweet, {filename: 'this/is/a/file'})).toBe(
      'thisisafile.md'
    )
  })
  it('Replaces handle, id, and name', () => {
    expect(
      createFilename(imageTweet, {filename: '[[handle]] - [[id]] - [[name]]'})
    ).toBe('Mappletons - 1292845757297557505 - Maggie Appleton 🧭.md')
  })
  it('Does not double extension if .md is present', () => {
    expect(
      createFilename(imageTweet, {
        filename: '[[handle]] - [[id]] - [[name]].md',
      })
    ).toBe('Mappletons - 1292845757297557505 - Maggie Appleton 🧭.md')
  })
  it('Replaces multiple occurrences of placeholders', () => {
    expect(createFilename(imageTweet, {filename: '[[id]] - [[id]]'})).toBe(
      '1292845757297557505 - 1292845757297557505.md'
    )
  })
  it('Replaces text and truncates', () => {
    expect(createFilename(imageTweet, {filename: '[[text]]'})).toBe(
      'Dirt is matter out of place - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and DangerHair on my head Clean. Hair on the table Dirty!Illustrating &amp; expanding on her main ideas h.md'
    )
  })
})

describe('File writing and path creation functions', () => {
  it('Returns default asset path', () => {
    expect(getLocalAssetPath({})).toBe('tweet-assets')
  })
  it('Return custom asset path', () => {
    expect(getLocalAssetPath({assetsPath: 'assets'})).toBe('assets')
  })
})

describe('Entity replacements', () => {
  it('replaces hashtags without infixing substrings', () => {
    expect(
      replaceEntities(
        {
          hashtags: [
            {start: 1, end: 2, tag: 'ab'},
            {start: 5, end: 7, tag: 'abc'},
          ],
        },
        "I'm a tweet with an #ab hashtag and an #abc hashtag."
      )
    ).toBe(
      "I'm a tweet with an [#ab](https://twitter.com/hashtag/ab) hashtag and an [#abc](https://twitter.com/hashtag/abc) hashtag."
    )
  })
  it('replaces cashtags without infixing substrings', () => {
    expect(
      replaceEntities(
        {
          cashtags: [
            {start: 1, end: 2, tag: 'ab'},
            {start: 5, end: 7, tag: 'abc'},
          ],
        },
        "I'm a tweet with an $ab cashtag and an $abc cashtag."
      )
    ).toBe(
      "I'm a tweet with an [$ab](https://twitter.com/search?q=%24ab) cashtag and an [$abc](https://twitter.com/search?q=%24abc) cashtag."
    )
  })
  it('replaces mentions without infixing substrings', () => {
    expect(
      replaceEntities(
        {
          mentions: [
            {start: 1, end: 2, username: 'ab'},
            {start: 5, end: 7, username: 'abc'},
          ],
        },
        "I'm a tweet with an @ab mention and an @abc mention."
      )
    ).toBe(
      "I'm a tweet with an [@ab](https://twitter.com/ab) mention and an [@abc](https://twitter.com/abc) mention."
    )
  })
})
