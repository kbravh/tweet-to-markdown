import {Tweet} from 'src/models'

export const koreanTweet: Tweet = {
  data: {
    id: '1564281755531722755',
    created_at: '2022-08-29T16:00:08.000Z',
    text: 'A Minji a day keeps the bad vibes away~\n\nPlaying with our money \n\n#JiU #지유 #Dreamcatcher #드림캐쳐 https://t.co/IRpqINac5X',
    attachments: {
      media_keys: ['3_1564281751844884482'],
    },
    conversation_id: '1564281755531722755',
    entities: {
      hashtags: [
        {
          start: 66,
          end: 70,
          tag: 'JiU',
        },
        {
          start: 71,
          end: 74,
          tag: '지유',
        },
        {
          start: 75,
          end: 88,
          tag: 'Dreamcatcher',
        },
        {
          start: 89,
          end: 94,
          tag: '드림캐쳐',
        },
      ],
      urls: [
        {
          start: 95,
          end: 118,
          url: 'https://t.co/IRpqINac5X',
          expanded_url:
            'https://twitter.com/PaniclnTheCity/status/1564281755531722755/photo/1',
          display_url: 'pic.twitter.com/IRpqINac5X',
          media_key: '3_1564281751844884482',
        },
      ],
    },
    author_id: '2539875322',
    public_metrics: {
      retweet_count: 160,
      reply_count: 4,
      like_count: 967,
      quote_count: 9,
    },
  },
  includes: {
    media: [
      {
        media_key: '3_1564281751844884482',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/FbVx9yNXEAIhA9O.jpg',
      },
    ],
    users: [
      {
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1534928249217851396/Mn95uof8_normal.jpg',
        name: 'tm ツ',
        username: 'PaniclnTheCity',
        id: '2539875322',
      },
    ],
  },
}
