import {Tweet} from 'src/models'

export const singleUrlTweet: Tweet = {
  data: {
    public_metrics: {
      retweet_count: 375,
      reply_count: 30,
      like_count: 1263,
      quote_count: 82,
    },
    id: '1537347873565773824',
    author_id: '1168568340492750849',
    conversation_id: '1537347873565773824',
    entities: {
      urls: [
        {
          start: 186,
          end: 209,
          url: 'https://t.co/NEt3knFTIs',
          expanded_url: 'https://tauri.app/',
          display_url: 'tauri.app',
          images: [
            {
              url: 'https://pbs.twimg.com/news_img/1565311456815370241/YEpYALAz?format=jpg&name=orig',
              width: 1280,
              height: 640,
            },
            {
              url: 'https://pbs.twimg.com/news_img/1565311456815370241/YEpYALAz?format=jpg&name=150x150',
              width: 150,
              height: 150,
            },
          ],
          status: 200,
          title:
            'Build smaller, faster, and more secure desktop applications with a web frontend | Tauri Apps',
          description:
            'Tauri is a framework for building tiny, blazing fast binaries for all major desktop platforms. Developers can integrate any front-end framework that compiles to HTML, JS and CSS for building their user interface.',
          unwound_url: 'https://tauri.app/',
        },
      ],
      annotations: [
        {
          start: 115,
          end: 126,
          probability: 0.4185,
          type: 'Product',
          normalized_text: 'Auto Updater',
        },
      ],
    },
    text: "After 4 months of release candidates we're proud to release version 1.0 of Tauri! 🎉 Windows, Menus, System Trays, Auto Updater and much more are now at your fingertips!\n\nCheck it out! ✨\nhttps://t.co/NEt3knFTIs",
    created_at: '2022-06-16T08:14:30.000Z',
  },
  includes: {
    users: [
      {
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1427375984475578389/jWzgho1b_normal.png',
        id: '1168568340492750849',
        username: 'TauriApps',
        name: 'Tauri',
      },
    ],
  },
}
