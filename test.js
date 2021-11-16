const test = require(`baretest`)(`Tweet to Markdown`)
import { strictEqual, deepStrictEqual } from `assert`
import { getTweetID, createPollTable, createMediaElements, createFilename, buildMarkdown } from './src/util'

// Assets
import poll_tweet, { includes } from `./mock/poll_tweet.json`
import image_tweet, { includes as _includes } from `./mock/image_tweet.json`
import mentions_tweet from `./mock/mentions_tweet.json`
import cashtag_tweet from `./mock/cashtag_tweet.json`

// Util tests
test(`extract tweet from url`, () => {
  const id = getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611`})
  strictEqual(id, `1213870628895428611`)
})
test(`extract tweet from url with query params`, () => {
  const id = getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611?s=20`})
  strictEqual(id, `1213870628895428611`)
})
test(`extract tweet from url with trailing slash`, () => {
  const id = getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611/`})
  strictEqual(id, `1213870628895428611`)
})
test(`return id`, () => {
  const id = getTweetID({src: `1213870628895428611`})
  strictEqual(id, `1213870628895428611`)
})
test(`create poll markdown`, () => {
  let poll = createPollTable(includes.polls)
  deepStrictEqual(poll, ["\n|Option|Votes|\n|---|:---:|\n|Spring|1373|\n|Fall|3054|"])
})
test(`create image links`, () => {
  let links = createMediaElements(_includes.media, {})
  deepStrictEqual(links, ['\n![3_1292845624120025090](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)','\n![3_1292845644567269376](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)'])
})
test(`default file name`, () => {
  let filename = createFilename(image_tweet, {})
  strictEqual(filename, "Mappletons - 1292845757297557505.md")
})
test(`user provided name with variables`, () => {
  let filename = createFilename(image_tweet, {filename: "[[handle]] - Dirt"})
  strictEqual(filename, "Mappletons - Dirt.md")
})

// Tweet tests
test(`Poll tweet`, async () => {
  const tweet = await buildMarkdown(poll_tweet, {})
  strictEqual(tweet, '---\nauthor: "polls"\nhandle: "@polls"\nsource: "https://twitter.com/polls/status/1029121914260860929"\n---\n![polls](https://pbs.twimg.com/profile_images/660160253913382913/qgvYqknJ_normal.jpg)\npolls ([@polls](https://twitter.com/polls))\n\n\n\nWhich is Better?\n\n|Option|Votes|\n|---|:---:|\n|Spring|1373|\n|Fall|3054|')
})
test(`Image tweet`, async () => {
  const tweet = await buildMarkdown(image_tweet, {})
  strictEqual(tweet, '---\nauthor: "Maggie Appleton"\nhandle: "@Mappletons"\nsource: "https://twitter.com/Mappletons/status/1292845757297557505"\n---\n![Mappletons](https://pbs.twimg.com/profile_images/1079304561892966406/1AHsGSnz_normal.jpg)\nMaggie Appleton ([@Mappletons](https://twitter.com/Mappletons))\n\n\n\n"Dirt is matter out of place" - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and Danger\n\n\n\nHair on my head? Clean. Hair on the table? Dirty!\n\n\n\nIllustrating &amp; expanding on her main ideas: [maggieappleton.com/dirt](http://maggieappleton.com/dirt) [pic.twitter.com/PSk7lHiv7z](https://twitter.com/Mappletons/status/1292845757297557505/photo/1)\n\n![3_1292845624120025090](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)\n\n![3_1292845644567269376](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)')
})
test(`Mentions tweet`, async () => {
  const tweet = await buildMarkdown(mentions_tweet, {})
  strictEqual(tweet, '---\nauthor: "Karey Higuera 🦈"\nhandle: "@kbravh"\nsource: "https://twitter.com/kbravh/status/1303753964291338240"\n---\n![kbravh](https://pbs.twimg.com/profile_images/1163169960505610240/R8BoDqiT_normal.jpg)\nKarey Higuera 🦈 ([@kbravh](https://twitter.com/kbravh))\n\n\n\nI\'ve just created a Node.js CLI tool to save tweets as Markdown, great for [@NotionHQ](https://twitter.com/NotionHQ), [@RoamResearch](https://twitter.com/RoamResearch), [@obsdmd](https://twitter.com/obsdmd), and other Markdown based note-taking systems! [github.com/kbravh/tweet-t…](https://github.com/kbravh/tweet-to-markdown)')
})
test(`Cashtag tweet`, async () => {
  const tweet = await buildMarkdown(cashtag_tweet, {})
  strictEqual(tweet, '---\nauthor: "ceascape.business.solutions"\nhandle: "@Ceascape_ca"\nsource: "https://twitter.com/Ceascape_ca/status/1301192107143561219"\n---\n![Ceascape_ca](https://pbs.twimg.com/profile_images/1058877044015038464/u68hN9LW_normal.jpg)\nceascape.business.solutions ([@Ceascape_ca](https://twitter.com/Ceascape_ca))\n\n\n\nToday I learned about [#cashtags](https://twitter.com/hashtag/cashtags)   - and found out my [$SBUX](https://twitter.com/search?q=%24SBUX) is in current tweet!  Must be [#coffee](https://twitter.com/hashtag/coffee)  time! [twitter.com/BTheriot2014/s…](https://twitter.com/BTheriot2014/status/1301180406226513921)')
})


test.run()
