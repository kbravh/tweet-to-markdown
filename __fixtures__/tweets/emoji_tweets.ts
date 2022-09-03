import {Tweet} from 'src/models'

export const emojiTweet: Tweet = {
  data: {
    conversation_id: '1565545829942845440',
    author_id: '1371963673103728642',
    text: 'FOLLOW YOUR INTEREST 💯\n\nDrop an emoji and #followback everyone who likes it ✨\n\n 💛 For everyone \n🏒 For #NHL\n🏀 For #NBA\n🏈 For #NFL\n⛏️ For Fortnite\n⚽ For Soccer\n🫰 For #KPOP\n🌊 For #Bluewaves\n🎶 For Music \n🎨 For Art \n📚 For #Anitwt\n📷 For Photography\n\nAdd 🔥 for a ShoutOut',
    id: '1565545829942845440',
    public_metrics: {
      retweet_count: 69,
      reply_count: 54,
      like_count: 71,
      quote_count: 1,
    },
    created_at: '2022-09-02T03:43:06.000Z',
    entities: {
      hashtags: [
        {
          start: 42,
          end: 53,
          tag: 'followback',
        },
        {
          start: 102,
          end: 106,
          tag: 'NHL',
        },
        {
          start: 113,
          end: 117,
          tag: 'NBA',
        },
        {
          start: 124,
          end: 128,
          tag: 'NFL',
        },
        {
          start: 164,
          end: 169,
          tag: 'KPOP',
        },
        {
          start: 176,
          end: 186,
          tag: 'Bluewaves',
        },
        {
          start: 217,
          end: 224,
          tag: 'Anitwt',
        },
      ],
    },
  },
  includes: {
    users: [
      {
        username: 'FollowBackAddic',
        id: '1371963673103728642',
        name: 'FollowBackAddict',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1547021534119723009/X2GTbeAa_normal.jpg',
      },
    ],
  },
}
