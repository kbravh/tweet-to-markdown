import type {Tweet} from 'src/models'

export const mentionsTweet: Tweet = {
  data: {
    text: "I've just created a Node.js CLI tool to save tweets as Markdown, great for @NotionHQ, @RoamResearch, @obsdmd, and other Markdown based note-taking systems! https://t.co/9qzNhz5cmN",
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 0,
      quote_count: 0,
    },
    created_at: '2020-09-09T17:55:42.000Z',
    entities: {
      urls: [
        {
          start: 156,
          end: 179,
          url: 'https://t.co/9qzNhz5cmN',
          expanded_url: 'https://github.com/kbravh/tweet-to-markdown',
          display_url: 'github.com/kbravh/tweet-t…',
          images: [
            {
              url: 'https://pbs.twimg.com/news_img/1501819606129950722/opZrrpCT?format=jpg&name=orig',
              width: 1280,
              height: 640,
            },
            {
              url: 'https://pbs.twimg.com/news_img/1501819606129950722/opZrrpCT?format=jpg&name=150x150',
              width: 150,
              height: 150,
            },
          ],
          status: 200,
          title:
            'GitHub - kbravh/tweet-to-markdown: A command line tool to convert Tweets to Markdown.',
          description:
            'A command line tool to convert Tweets to Markdown. - GitHub - kbravh/tweet-to-markdown: A command line tool to convert Tweets to Markdown.',
          unwound_url: 'https://github.com/kbravh/tweet-to-markdown',
        },
      ],
      mentions: [
        {
          start: 75,
          end: 84,
          username: 'NotionHQ',
          id: '708915428454576128',
        },
        {
          start: 86,
          end: 99,
          username: 'RoamResearch',
          id: '1190410678273626113',
        },
        {
          start: 101,
          end: 108,
          username: 'obsdmd',
          id: '1239876481951596545',
        },
      ],
    },
    id: '1303753964291338240',
    author_id: '1143604512999034881',
    conversation_id: '1303753964291338240',
  },
  includes: {
    users: [
      {
        username: 'kbravh',
        name: 'Karey Higuera 🦈',
        id: '1143604512999034881',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1163169960505610240/R8BoDqiT_normal.jpg',
      },
    ],
  },
}

export const multipleMentionsTweet: Tweet = {
  data: {
    created_at: '2022-06-18T21:25:29.000Z',
    referenced_tweets: [
      {
        type: 'replied_to',
        id: '1538271706682384385',
      },
    ],
    conversation_id: '1538271613770158082',
    public_metrics: {
      retweet_count: 0,
      reply_count: 4,
      like_count: 14,
      quote_count: 0,
    },
    author_id: '55014825',
    text: '@visualizevalue @EvansNifty @OzolinsJanis @milanicreative @design_by_kp @victor_bigfield @StartupIllustr @tracytangtt @AlexMaeseJ @ash_lmb @moina_abdul @Its_Prasa @elliottaleksndr @aaraalto @tanoseihito @jeffkortenbosch @FerraroRoberto @eneskartall @SachinRamje @AidanYeep @jozzua Here they are:\n\n@EvansNifty\n@OzolinsJanis\n@milanicreative\n@design_by_kp\n@victor_bigfield\n@StartupIllustr\n@tracytangtt\n@AlexMaeseJ\n@ash_lmb\n@moina_abdul\n@Its_Prasa\n@elliottaleksndr\n@aaraalto\n@tanoseihito\n@jeffkortenbosch\n@FerraroRoberto\n@eneskartall\n@SachinRamje\n@AidanYeep\n@jozzua',
    id: '1538271708918034433',
    entities: {
      mentions: [
        {
          start: 0,
          end: 15,
          username: 'visualizevalue',
          id: '1086480695428567041',
        },
        {
          start: 16,
          end: 27,
          username: 'EvansNifty',
          id: '1318516465725788164',
        },
        {
          start: 28,
          end: 41,
          username: 'OzolinsJanis',
          id: '1326123605709688832',
        },
        {
          start: 42,
          end: 57,
          username: 'milanicreative',
          id: '1462211068625924100',
        },
        {
          start: 58,
          end: 71,
          username: 'design_by_kp',
          id: '1444046159782158337',
        },
        {
          start: 72,
          end: 88,
          username: 'victor_bigfield',
          id: '1353447414624116736',
        },
        {
          start: 89,
          end: 104,
          username: 'StartupIllustr',
          id: '1334449652549083137',
        },
        {
          start: 105,
          end: 117,
          username: 'tracytangtt',
          id: '1330784657160294401',
        },
        {
          start: 118,
          end: 129,
          username: 'AlexMaeseJ',
          id: '1324290451831201792',
        },
        {
          start: 130,
          end: 138,
          username: 'ash_lmb',
          id: '1311813178003730432',
        },
        {
          start: 139,
          end: 151,
          username: 'moina_abdul',
          id: '1306429743739236352',
        },
        {
          start: 163,
          end: 179,
          username: 'elliottaleksndr',
          id: '1266118755005935621',
        },
        {
          start: 180,
          end: 189,
          username: 'aaraalto',
          id: '856260757033451522',
        },
        {
          start: 190,
          end: 202,
          username: 'tanoseihito',
          id: '2987250326',
        },
        {
          start: 203,
          end: 219,
          username: 'jeffkortenbosch',
          id: '974181336',
        },
        {
          start: 220,
          end: 235,
          username: 'FerraroRoberto',
          id: '349202256',
        },
        {
          start: 236,
          end: 248,
          username: 'eneskartall',
          id: '96602730',
        },
        {
          start: 249,
          end: 261,
          username: 'SachinRamje',
          id: '38111262',
        },
        {
          start: 262,
          end: 272,
          username: 'AidanYeep',
          id: '25479191',
        },
        {
          start: 273,
          end: 280,
          username: 'jozzua',
          id: '4311721',
        },
        {
          start: 297,
          end: 308,
          username: 'EvansNifty',
          id: '1318516465725788164',
        },
        {
          start: 309,
          end: 322,
          username: 'OzolinsJanis',
          id: '1326123605709688832',
        },
        {
          start: 323,
          end: 338,
          username: 'milanicreative',
          id: '1462211068625924100',
        },
        {
          start: 339,
          end: 352,
          username: 'design_by_kp',
          id: '1444046159782158337',
        },
        {
          start: 353,
          end: 369,
          username: 'victor_bigfield',
          id: '1353447414624116736',
        },
        {
          start: 370,
          end: 385,
          username: 'StartupIllustr',
          id: '1334449652549083137',
        },
        {
          start: 386,
          end: 398,
          username: 'tracytangtt',
          id: '1330784657160294401',
        },
        {
          start: 399,
          end: 410,
          username: 'AlexMaeseJ',
          id: '1324290451831201792',
        },
        {
          start: 411,
          end: 419,
          username: 'ash_lmb',
          id: '1311813178003730432',
        },
        {
          start: 420,
          end: 432,
          username: 'moina_abdul',
          id: '1306429743739236352',
        },
        {
          start: 444,
          end: 460,
          username: 'elliottaleksndr',
          id: '1266118755005935621',
        },
        {
          start: 461,
          end: 470,
          username: 'aaraalto',
          id: '856260757033451522',
        },
        {
          start: 471,
          end: 483,
          username: 'tanoseihito',
          id: '2987250326',
        },
        {
          start: 484,
          end: 500,
          username: 'jeffkortenbosch',
          id: '974181336',
        },
        {
          start: 501,
          end: 516,
          username: 'FerraroRoberto',
          id: '349202256',
        },
        {
          start: 517,
          end: 529,
          username: 'eneskartall',
          id: '96602730',
        },
        {
          start: 530,
          end: 542,
          username: 'SachinRamje',
          id: '38111262',
        },
        {
          start: 543,
          end: 553,
          username: 'AidanYeep',
          id: '25479191',
        },
        {
          start: 554,
          end: 561,
          username: 'jozzua',
          id: '4311721',
        },
      ],
    },
  },
  includes: {
    users: [
      {
        name: 'Edil Medeiros 🚢 ✏️🏴‍☠️ 🧩',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/669315274353561600/eHheoab4_normal.jpg',
        username: 'jose_edil',
        id: '55014825',
      },
    ],
  },
}
