const test = require(`baretest`)(`Tweet to Markdown`)
const assert = require(`assert`)
const util = require(`./util`)

test(`extract tweet from url`, () => {
  const id = util.getTweetID({src: `https://twitter.com/JoshWComeau/status/1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})
test(`return id`, () => {
  const id = util.getTweetID({src: `1213870628895428611`})
  assert.strictEqual(id, `1213870628895428611`)
})

test.run()