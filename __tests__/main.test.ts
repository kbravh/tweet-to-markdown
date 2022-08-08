import {server} from 'src/mocks/server'
import {log, logErrorToFile, writeTweet} from '../src/util'
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
  tweetThread,
  tweetWithMissingParent,
} from '__fixtures__/tweets'
import {BEARER_TOKEN} from './consts'

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
    expect(writeTweet).toBeCalledWith(
      imageTweet,
      `---
author: "Maggie Appleton 🧭"
handle: "@Mappletons"
source: "https://twitter.com/Mappletons/status/1292845757297557505"
---
![Mappletons](https://pbs.twimg.com/profile_images/1079304561892966406/1AHsGSnz_normal.jpg)
Maggie Appleton 🧭 ([@Mappletons](https://twitter.com/Mappletons))


"Dirt is matter out of place" - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and Danger

Hair on my head? Clean. Hair on the table? Dirty!

Illustrating & expanding on her main ideas: [maggieappleton.com/dirt](http://maggieappleton.com/dirt) [pic.twitter.com/PSk7lHiv7z](https://twitter.com/Mappletons/status/1292845757297557505/photo/1)

![](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)

![](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)


[Tweet link](https://twitter.com/Mappletons/status/1292845757297557505)`,
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
    expect(writeTweet).toBeCalledWith(
      tweetThread[0],
      `---
author: "Geoffrey Litt"
handle: "@geoffreylitt"
source: "https://twitter.com/geoffreylitt/status/1277645969975377923"
---
![geoffreylitt](https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg)
Geoffrey Litt ([@geoffreylitt](https://twitter.com/geoffreylitt))


A theory about why tools like Airtable and Notion are so compelling: they provide a much-needed synthesis between the design philosophies of UNIX and Apple.

Short thread: [pic.twitter.com/YjOLsIGVRD](https://twitter.com/geoffreylitt/status/1277645969975377923/photo/1)

![](https://pbs.twimg.com/media/EbsMfE8XkAc9TiK.png)

![](https://pbs.twimg.com/media/EbsMiqGX0AAwi9R.jpg)


[Tweet link](https://twitter.com/geoffreylitt/status/1277645969975377923)

---

![geoffreylitt](https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg)
Geoffrey Litt ([@geoffreylitt](https://twitter.com/geoffreylitt))


UNIX is still the best working example of "tools not apps": small sharp tools that the user can flexibly compose to meet their needs.

Once you've written a few bash pipelines, it's hard to be satisfied with disconnected, siloed "apps"


[Tweet link](https://twitter.com/geoffreylitt/status/1277645971401433090)

---

![geoffreylitt](https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg)
Geoffrey Litt ([@geoffreylitt](https://twitter.com/geoffreylitt))


The problem is, while the roots are solid, the terminal as UI is extremely hostile to users, esp beginners. No discoverability, cryptic flags, lots of cruft and chaos.

[twitter.com/geoffreylitt/s…](https://twitter.com/geoffreylitt/status/1187357294415302657) [pic.twitter.com/TjOL7PXU2y](https://twitter.com/geoffreylitt/status/1277645972529647616/photo/1)

![](https://pbs.twimg.com/media/EbsNx5_XkAEncJW.png)


[Tweet link](https://twitter.com/geoffreylitt/status/1277645972529647616)`,
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
    expect(writeTweet).toBeCalledWith(
      tweetThread[0],
      `---
author: "Geoffrey Litt"
handle: "@geoffreylitt"
source: "https://twitter.com/geoffreylitt/status/1277645969975377923"
---
![geoffreylitt](https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg)
Geoffrey Litt ([@geoffreylitt](https://twitter.com/geoffreylitt))


A theory about why tools like Airtable and Notion are so compelling: they provide a much-needed synthesis between the design philosophies of UNIX and Apple.

Short thread: [pic.twitter.com/YjOLsIGVRD](https://twitter.com/geoffreylitt/status/1277645969975377923/photo/1)

![](https://pbs.twimg.com/media/EbsMfE8XkAc9TiK.png)

![](https://pbs.twimg.com/media/EbsMiqGX0AAwi9R.jpg)

UNIX is still the best working example of "tools not apps": small sharp tools that the user can flexibly compose to meet their needs.

Once you've written a few bash pipelines, it's hard to be satisfied with disconnected, siloed "apps"

The problem is, while the roots are solid, the terminal as UI is extremely hostile to users, esp beginners. No discoverability, cryptic flags, lots of cruft and chaos.

[twitter.com/geoffreylitt/s…](https://twitter.com/geoffreylitt/status/1187357294415302657) [pic.twitter.com/TjOL7PXU2y](https://twitter.com/geoffreylitt/status/1277645972529647616/photo/1)

![](https://pbs.twimg.com/media/EbsNx5_XkAEncJW.png)





[Thread link](https://twitter.com/geoffreylitt/status/1277645969975377923)`,
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
    expect(writeTweet).toBeCalledWith(
      tweetWithMissingParent,
      `---
author: "Rasmus Andersson"
handle: "@rsms"
source: "https://twitter.com/rsms/status/1543295680088662016"
---
![rsms](https://pbs.twimg.com/profile_images/1432033002880520193/nuDFioj3_normal.jpg)
Rasmus Andersson ([@rsms](https://twitter.com/rsms))


[@nevyn](https://twitter.com/nevyn) Flash was awesome in so many ways! Being proprietary closed-source software was not awesome though.


[Tweet link](https://twitter.com/rsms/status/1543295680088662016)`,
      options
    )
    expect(log).toBeCalled()
    expect(logErrorToFile)
      .toBeCalledWith(`Bad Request; Could not find tweet with id: [1543286531431059456].
Error: Request failed with status code 400
    at createError (C:\\Users\\karey\\projects\\tweet-to-markdown\\node_modules\\axios\\lib\\core\\createError.js:16:15)
    at settle (C:\\Users\\karey\\projects\\tweet-to-markdown\\node_modules\\axios\\lib\\core\\settle.js:17:12)
    at PassThrough.handleStreamEnd (C:\\Users\\karey\\projects\\tweet-to-markdown\\node_modules\\axios\\lib\\adapters\\http.js:269:11)
    at PassThrough.emit (node:events:527:28)
    at endReadableNT (node:internal/streams/readable:1345:12)
    at processTicksAndRejections (node:internal/process/task_queues:83:21)`)
  })
})
