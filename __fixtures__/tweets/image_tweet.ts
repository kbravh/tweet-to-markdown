import type {Tweet} from 'src/models'

export const imageTweet: Tweet = {
  data: {
    created_at: '2020-08-10T15:30:23.000Z',
    conversation_id: '1292845757297557505',
    id: '1292845757297557505',
    attachments: {
      media_keys: ['3_1292845624120025090', '3_1292845644567269376'],
    },
    entities: {
      annotations: [
        {
          start: 104,
          end: 115,
          probability: 0.9801,
          type: 'Person',
          normalized_text: 'Mary Douglas',
        },
      ],
      urls: [
        {
          start: 260,
          end: 283,
          url: 'https://t.co/O2P7WRO1XL',
          expanded_url: 'http://maggieappleton.com/dirt',
          display_url: 'maggieappleton.com/dirt',
        },
        {
          start: 284,
          end: 307,
          url: 'https://t.co/PSk7lHiv7z',
          expanded_url:
            'https://twitter.com/Mappletons/status/1292845757297557505/photo/1',
          display_url: 'pic.twitter.com/PSk7lHiv7z',
          media_key: '3_1292845624120025090',
        },
        {
          start: 284,
          end: 307,
          url: 'https://t.co/PSk7lHiv7z',
          expanded_url:
            'https://twitter.com/Mappletons/status/1292845757297557505/photo/1',
          display_url: 'pic.twitter.com/PSk7lHiv7z',
          media_key: '3_1292845644567269376',
        },
      ],
    },
    author_id: '1343443016',
    text: '"Dirt is matter out of place" - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and Danger\n\nHair on my head? Clean. Hair on the table? Dirty!\n\nIllustrating &amp; expanding on her main ideas: https://t.co/O2P7WRO1XL https://t.co/PSk7lHiv7z',
    public_metrics: {
      retweet_count: 29,
      reply_count: 11,
      like_count: 191,
      quote_count: 2,
    },
  },
  includes: {
    media: [
      {
        media_key: '3_1292845624120025090',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg',
      },
      {
        media_key: '3_1292845644567269376',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg',
      },
    ],
    users: [
      {
        username: 'Mappletons',
        id: '1343443016',
        name: 'Maggie Appleton 🧭',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1079304561892966406/1AHsGSnz_normal.jpg',
      },
    ],
  },
}

export const imageTweetWithAnnotations: Tweet = {
  data: {
    author_id: '15668072',
    text: 'This variation on the smashburger with white onions smashed right into the patty is *solid*. @jhooks puttin’ that Smashula to work. 😍🍔 https://t.co/5xdUezbxfd',
    entities: {
      urls: [
        {
          start: 135,
          end: 158,
          url: 'https://t.co/5xdUezbxfd',
          expanded_url:
            'https://twitter.com/jlengstorf/status/1556457532037554176/photo/1',
          display_url: 'pic.twitter.com/5xdUezbxfd',
          media_key: '3_1556457395634577409',
        },
        {
          start: 135,
          end: 158,
          url: 'https://t.co/5xdUezbxfd',
          expanded_url:
            'https://twitter.com/jlengstorf/status/1556457532037554176/photo/1',
          display_url: 'pic.twitter.com/5xdUezbxfd',
          media_key: '3_1556457395638792192',
        },
        {
          start: 135,
          end: 158,
          url: 'https://t.co/5xdUezbxfd',
          expanded_url:
            'https://twitter.com/jlengstorf/status/1556457532037554176/photo/1',
          display_url: 'pic.twitter.com/5xdUezbxfd',
          media_key: '3_1556457395714269184',
        },
      ],
      mentions: [
        {
          start: 93,
          end: 100,
          username: 'jhooks',
          id: '12087242',
        },
      ],
    },
    attachments: {
      media_keys: [
        '3_1556457395634577409',
        '3_1556457395638792192',
        '3_1556457395714269184',
      ],
    },
    conversation_id: '1556457532037554176',
    id: '1556457532037554176',
    public_metrics: {
      retweet_count: 0,
      reply_count: 4,
      like_count: 13,
      quote_count: 0,
    },
    created_at: '2022-08-08T01:49:27.000Z',
  },
  includes: {
    media: [
      {
        alt_text: 'Joel smashing burgers.',
        media_key: '3_1556457395634577409',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/FZmlwT7UIAEql9P.jpg',
      },
      {
        alt_text: 'Smash burgers with white onions smashed into the top side.',
        media_key: '3_1556457395638792192',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/FZmlwT8UcAAotNc.jpg',
      },
      {
        alt_text:
          'Smash burgers in the process of being flipped. There are onions on the griddle side of the patties and a serious crust on the top.',
        media_key: '3_1556457395714269184',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/FZmlwUOUIAAl41A.jpg',
      },
    ],
    users: [
      {
        username: 'jlengstorf',
        name: 'Jason Lengstorf',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1524064394157576193/tB5HL_ES_normal.jpg',
        id: '15668072',
      },
    ],
  },
}
export const imageTweetWithAnnotationsAndNewlines: Tweet = {
  data: {
    id: '1555175849569263618',
    text: 'Which of the following function argument styles do you prefer?\n\nMultiple arguments (extra values destructured from 3rd arg)? \n\nOr single argument (all values destructured)?\n\nOr something else? https://t.co/cfRvBKXafI',
    attachments: {
      media_keys: ['3_1555174879342825479'],
    },
    public_metrics: {
      retweet_count: 2,
      reply_count: 76,
      like_count: 106,
      quote_count: 1,
    },
    entities: {
      urls: [
        {
          start: 193,
          end: 216,
          url: 'https://t.co/cfRvBKXafI',
          expanded_url:
            'https://twitter.com/DavidKPiano/status/1555175849569263618/photo/1',
          display_url: 'pic.twitter.com/cfRvBKXafI',
          media_key: '3_1555174879342825479',
        },
      ],
    },
    created_at: '2022-08-04T12:56:30.000Z',
    conversation_id: '1555175849569263618',
    author_id: '992126114',
  },
  includes: {
    media: [
      {
        alt_text:
          '  // Multiple arguments\n  entry: (context, event, { action }) => {/* ... */},\n\n  // Unused arguments\n  entry: (_context, _event, { action }) => {/* ... */},\n\n    \n  // Single argument (destructuring)\n  entry: ({ context, event, action }) => {/* ... */},\n\n  // Unused properties\n  entry: ({ action }) => {/* ... */}',
        media_key: '3_1555174879342825479',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/FZUXUCbXEAcAj_L.jpg',
      },
    ],
    users: [
      {
        profile_image_url:
          'https://pbs.twimg.com/profile_images/619677584805208064/RwwbnNpi_normal.jpg',
        name: 'David K. 🎹',
        id: '992126114',
        username: 'DavidKPiano',
      },
    ],
  },
}
