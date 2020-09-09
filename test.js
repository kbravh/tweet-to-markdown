const test = require(`baretest`)(`Tweet to Markdown`)
const assert = require(`assert`)
const util = require(`./util`)

const clipboard = require(`clipboardy`)

// Assets
const poll_tweet = require(`./mock/poll_tweet.json`)
const image_tweet = require(`./mock/image_tweet.json`)

test(`extract tweet from url`, () => {
  const id = util.getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})
test(`return id`, () => {
  const id = util.getTweetID({src: `1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})
test(`copy to clipboard`, async () => {
  await util.copyToClipboard("Test text")
  let board = await clipboard.read()
  assert.strictEqual(board, "Test text")
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

test(`check non-existent file path`, () => {

})

test.run()