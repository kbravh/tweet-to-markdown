const test = require(`baretest`)(`Tweet to Markdown`)
const assert = require(`assert`)
const util = require(`./util`)

const clipboard = require(`clipboardy`)

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

test.run()