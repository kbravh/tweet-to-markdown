const test = require(`baretest`)(`Tweet to Markdown`)
const assert = require(`assert`)
const util = require(`./util`)

const clipboard = require(`clipboardy`)

// Assets
const poll_tweet = require(`./mock/poll_tweet.json`)

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

test.run()