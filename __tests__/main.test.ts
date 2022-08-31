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
  })

  it('Properly replaces multiple occurrences of the same mention', async () => {
    const options = {
      bearer: BEARER_TOKEN,
      src: multipleMentionsTweet.data.id,
    }
    await processTweetRequest(options)
    expect(writeTweet).toBeCalledWith(
      multipleMentionsTweet,
      `---
author: "Edil Medeiros 🚢 ✏️🏴‍☠️ 🧩"
handle: "@jose_edil"
source: "https://twitter.com/jose_edil/status/1538271708918034433"
---
![jose_edil](https://pbs.twimg.com/profile_images/669315274353561600/eHheoab4_normal.jpg)
Edil Medeiros 🚢 ✏️🏴‍☠️ 🧩 ([@jose_edil](https://twitter.com/jose_edil))


[@visualizevalue](https://twitter.com/visualizevalue) [@EvansNifty](https://twitter.com/EvansNifty) [@OzolinsJanis](https://twitter.com/OzolinsJanis) [@milanicreative](https://twitter.com/milanicreative) [@design_by_kp](https://twitter.com/design_by_kp) [@victor_bigfield](https://twitter.com/victor_bigfield) [@StartupIllustr](https://twitter.com/StartupIllustr) [@tracytangtt](https://twitter.com/tracytangtt) [@AlexMaeseJ](https://twitter.com/AlexMaeseJ) [@ash_lmb](https://twitter.com/ash_lmb) [@moina_abdul](https://twitter.com/moina_abdul) @Its_Prasa [@elliottaleksndr](https://twitter.com/elliottaleksndr) [@aaraalto](https://twitter.com/aaraalto) [@tanoseihito](https://twitter.com/tanoseihito) [@jeffkortenbosch](https://twitter.com/jeffkortenbosch) [@FerraroRoberto](https://twitter.com/FerraroRoberto) [@eneskartall](https://twitter.com/eneskartall) [@SachinRamje](https://twitter.com/SachinRamje) [@AidanYeep](https://twitter.com/AidanYeep) [@jozzua](https://twitter.com/jozzua) Here they are:

[@EvansNifty](https://twitter.com/EvansNifty)
[@OzolinsJanis](https://twitter.com/OzolinsJanis)
[@milanicreative](https://twitter.com/milanicreative)
[@design_by_kp](https://twitter.com/design_by_kp)
[@victor_bigfield](https://twitter.com/victor_bigfield)
[@StartupIllustr](https://twitter.com/StartupIllustr)
[@tracytangtt](https://twitter.com/tracytangtt)
[@AlexMaeseJ](https://twitter.com/AlexMaeseJ)
[@ash_lmb](https://twitter.com/ash_lmb)
[@moina_abdul](https://twitter.com/moina_abdul)
@Its_Prasa
[@elliottaleksndr](https://twitter.com/elliottaleksndr)
[@aaraalto](https://twitter.com/aaraalto)
[@tanoseihito](https://twitter.com/tanoseihito)
[@jeffkortenbosch](https://twitter.com/jeffkortenbosch)
[@FerraroRoberto](https://twitter.com/FerraroRoberto)
[@eneskartall](https://twitter.com/eneskartall)
[@SachinRamje](https://twitter.com/SachinRamje)
[@AidanYeep](https://twitter.com/AidanYeep)
[@jozzua](https://twitter.com/jozzua)


[Tweet link](https://twitter.com/jose_edil/status/1538271708918034433)`,
      options
    )
  })
})
