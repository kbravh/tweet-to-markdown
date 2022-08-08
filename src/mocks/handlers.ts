import {rest} from 'msw'
import {tweets} from '__fixtures__/tweets'
import { BEARER_TOKEN } from '__tests__/consts'

export const handlers = [
  rest.get('https://ttm.kbravh.dev/api/tweet', (req, res, ctx) => {
    const auth = req.headers.get('Authorization')
    const key = auth.split('Bearer ')?.[1] ?? ''
    if (key !== BEARER_TOKEN) {
      return res(ctx.status(401))
    }

    const id = req.url.searchParams.get('tweet')
    const tweet = tweets[id]

    if (tweet) {
      return res(ctx.status(200), ctx.json(tweet))
    }
    return res(ctx.status(400), ctx.text(`Could not find tweet with id: [${id}].`))
  }),
]
