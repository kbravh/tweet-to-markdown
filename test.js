const test = require(`baretest`)(`Tweet to Markdown`)
const assert = require(`assert`)
const util = require(`./util`)

// Assets
const poll_tweet = require(`./mock/poll_tweet.json`)
const image_tweet = require(`./mock/image_tweet.json`)
const mentions_tweet = require(`./mock/mentions_tweet.json`)
const cashtag_tweet = require(`./mock/cashtag_tweet.json`)

// Util tests
test(`extract tweet from url`, () => {
  const id = util.getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})
test(`return id`, () => {
  const id = util.getTweetID({src: `1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})
test(`create poll markdown`, () => {
  let poll = util.createPollTable(poll_tweet.includes.polls)
  assert.deepStrictEqual(poll, ["\n|Option|Votes|\n|---|:---:|\n|Spring|1373|\n|Fall|3054|"])
})
test(`create image links`, () => {
  let links = util.createMediaElements(image_tweet.includes.media)
  assert.deepStrictEqual(links, ['![3_1292845624120025090](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)','![3_1292845644567269376](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)'])
})
test(`default file name`, () => {
  let filename = util.createFilename(image_tweet, {})
  assert.strictEqual(filename, "Mappletons - 1292845757297557505.md")
})
test(`user provided name with variables`, () => {
  let filename = util.createFilename(image_tweet, {filename: "[[handle]] - Dirt"})
  assert.strictEqual(filename, "Mappletons - Dirt.md")
})

// Tweet tests
test(`Poll tweet`, () => {
  const tweet = util.buildMarkdown(poll_tweet, {})
  assert.strictEqual(tweet, '---\nauthor: polls\nhandle: @polls\n---\n![polls](https://pbs.twimg.com/profile_images/660160253913382913/qgvYqknJ_normal.jpg)\npolls ([@polls](https://twitter.com/polls))\n\n\n\nWhich is Better?\n\n|Option|Votes|\n|---|:---:|\n|Spring|1373|\n|Fall|3054|')
})
test(`Image tweet`, () => {
  const tweet = util.buildMarkdown(image_tweet, {})
  assert.strictEqual(tweet, '---\nauthor: Maggie Appleton\nhandle: @Mappletons\n---\n![Mappletons](https://pbs.twimg.com/profile_images/1079304561892966406/1AHsGSnz_normal.jpg)\nMaggie Appleton ([@Mappletons](https://twitter.com/Mappletons))\n\n\n\n"Dirt is matter out of place" - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and Danger\n\n\n\nHair on my head? Clean. Hair on the table? Dirty!\n\n\n\nIllustrating &amp; expanding on her main ideas: [maggieappleton.com/dirt](http://maggieappleton.com/dirt) [pic.twitter.com/PSk7lHiv7z](https://twitter.com/Mappletons/status/1292845757297557505/photo/1)\n![3_1292845624120025090](https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg)\n![3_1292845644567269376](https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg)')
})
test(`Mentions tweet`, () => {
  const tweet = util.buildMarkdown(mentions_tweet, {})
  assert.strictEqual(tweet, '---\nauthor: Karey Higuera 🦈\nhandle: @kbravh\n---\n![kbravh](https://pbs.twimg.com/profile_images/1163169960505610240/R8BoDqiT_normal.jpg)\nKarey Higuera 🦈 ([@kbravh](https://twitter.com/kbravh))\n\n\n\nI\'ve just created a Node.js CLI tool to save tweets as Markdown, great for [@NotionHQ](https://twitter.com/NotionHQ), [@RoamResearch](https://twitter.com/RoamResearch), [@obsdmd](https://twitter.com/obsdmd), and other Markdown based note-taking systems! [github.com/kbravh/tweet-t…](https://github.com/kbravh/tweet-to-markdown)')
})
test(`Cashtag tweet`, () => {
  const tweet = util.buildMarkdown(cashtag_tweet, {})
  assert.strictEqual(tweet, '---\nauthor: ceascape.business.solutions\nhandle: @Ceascape_ca\n---\n![Ceascape_ca](https://pbs.twimg.com/profile_images/1058877044015038464/u68hN9LW_normal.jpg)\nceascape.business.solutions ([@Ceascape_ca](https://twitter.com/Ceascape_ca))\n\n\n\nToday I learned about [#cashtags](https://twitter.com/hashtag/cashtags)   - and found out my [$SBUX](https://twitter.com/search?q=%24SBUX) is in current tweet!  Must be [#coffee](https://twitter.com/hashtag/coffee)  time! [twitter.com/BTheriot2014/s…](https://twitter.com/BTheriot2014/status/1301180406226513921)')
})


test.run()