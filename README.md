<!-- PROJECT SHIELDS -->
<!-- [![Contributors][contributors-shield]][contributors-url] -->
<!-- [![Forks][forks-shield]][forks-url] -->

[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<p align="center">
  <a href="https://github.com/kbravh/tweet-to-markdown">
    <img src="images/tweet-to-markdown-logo.svg" alt="Logo" height=50>
  </a>

  <h3 align="center">Tweet to Markdown</h3>

  <p align="center">
    A command line tool to quickly save tweets as Markdown.
    <br />
    <br />
    <a href="https://github.com/kbravh/tweet-to-markdown/issues">Report a Bug</a>
    ·
    <a href="https://github.com/kbravh/tweet-to-markdown/issues">Request a Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

This command line tool allows you to quickly save a tweet in Markdown format. This is great for Zettelkasten note-taking or any other commonplace notebook, vade mecum, Obsidian, Roam, Foam, &c. It is built on the new Twitter v2 API.

![Demo of `ttm` in the command line](./images/ttm_demo.gif)

## Installing

⚠ **You'll need to have Node.js of at least `v10.x` to use this tool.**

You can install this CLI tool by running

```bash
yarn global add tweet-to-markdown
```

or

```bash
npm install --global tweet-to-markdown
```

You can also run it without installing:

```bash
npx tweet-to-markdown
```

<!-- USAGE EXAMPLES -->

## Setup

To use this tool, you have two options:
- Sign up for a free API key from https://ttm.kbravh.dev (new in v2.0.0)
- Sign up for a bearer token through the Twitter Developer dashboard

Getting a free API key from https://ttm.kbravh.dev is the easiest method of using this plugin, as you won't have to go through Twitter's developer application process. Their application is tedious, and they don't always approve requests. However, you are more than welcome to follow the guide below to retrieve your own bearer token from Twitter. This will give you the most control, freedom, and security over your usage.

### Free TTM API key
You can sign up for a free API key at https://ttm.kbravh.dev by signing in with either your GitHub or Twitter account and heading to your account page. Once you sign in and retrieve your API key from your account page, either store it in the environment variable `TTM_API_KEY` or pass it to the command line tool with the `-b` (`--bearer`) flag with each call.

### Twitter Developer bearer token
To get a bearer token from Twitter, you'll need to set up an application on the [Twitter developer dashboard](https://developer.twitter.com/en/portal/dashboard). For a guide on doing so, see [Getting a bearer token](https://github.com/kbravh/obsidian-tweet-to-markdown/blob/main/BearerTokenGuide.md). Once you have the bearer token, either store it in the environment variable `TWITTER_BEARER_TOKEN` or pass it to the command line tool with the `-b` (`--bearer`) flag with each call.

## Usage

Grabbing a tweet is as easy as calling the `ttm` command and passing in the tweet URL.

```bash
ttm -b "<bearer token>" https://twitter.com/JoshWComeau/status/1213870628895428611
# Tweet saved as JoshWComeau - 1213870628895428611.md
```

Nota bene: If passing your bearer token as an argument instead of an environment variable, wrap your bearer token or API key in quotes to prevent any special symbols from being misinterpreted by the command line. Also, if using a TTM API key, be sure to include the entire key, from the `TTM` at the beginning all the way to the end with the alphanumeric characters (e.g. `"TTM>asdf1123"` or `"TTM_ghjk4567"`).

The tweet will be saved to a Markdown file in the current directory. Here's how the tweet will look:

![Screenshot of the rendered Markdown file](images/tweet-markdown-screenshot.png)

Any attached images, polls, and links will also be linked and displayed in the file.

## Options

There are *many* options to customize how this tool works. It is highly recommended to find the options you need and set up an alias in your terminal.

For example on Mac or Linux, you can define an alias with your options like so:

```bash
alias ttm="ttm -p $HOME/notes --assets --quoted"
```

For Windows, have a look at [DOSKEY](https://superuser.com/a/560558).

### Copy to Clipboard

What if you want to just copy the Markdown to the clipboard instead of saving to a file? Just pass the `-c` (`--clipboard`) flag.

```bash
ttm -c https://twitter.com/JoshWComeau/status/1213870628895428611
#Tweet copied to the clipboard.
```

### Quoted tweets

If you would like to include quoted tweets, pass the `-q` (`--quoted`) flag. This is disabled by default because a separate request has to be made to fetch the quoted tweet.

```bash
ttm <tweet url> -q
```

### Tweet threads
To capture an entire tweet thread, use the `-t` (`--thread`) flag and pass the URL of the **last** tweet in the thread.

Nota bene: this will make a separate network request for each tweet.

```bash
ttm <last tweet url> -t
```

#### Condensed threads
Instead of showing complete, individual tweets with profile picture, date, etc. when downloading a thread, this option will show the header once and then only show the tweet bodies, representing tweet threads as a cohesive body of text. A header will be shown if a different author appears in the thread, for example if you're downloading a conversation between various authors.

```bash
ttm <last tweet url> -T
```

### Text only
With this flag, only the text of the tweet itself will be included. No author tags, frontmatter, or other information will be attached.

Nota bene: This has not been tested well with threads. Please use at your own risk. Condensed threads may be a better fit for you.

### Custom File Name

In order to save the tweet with a custom filename, pass the desired name to the `--filename` flag. You can use the variables `[[name]]`, `[[handle]]`, `[[text]]`, and `[[id]]` in your filename, which will be replaced according to the following chart. The file extension `.md` will also be added automatically.

| Variable | Replacement |
|:---:|---|
|[[handle]]|The user's handle (the part that follows the @ symbol)|
|[[name]]|The user's name|
|[[id]]|The unique ID assigned to the tweet|
|[[text]]|The entire text of the tweet (truncated to fit OS filename length restrictions)|.

```bash
ttm <tweet url> --filename "[[handle]] - Favicon versioning".
# Tweet saved to JoshWComeau - Favicon versioning.md
```

If the file already exists, an error will be thrown unless you pass the `-f` (`--force`) flag to overwrite the file.

### Custom File Path

To save the tweet to a place other than the current directory, pass the location to the `-p` (`--path`) flag. If this path doesn't exist, it will be recursively created.

```bash
ttm <tweet url> -p "./tweets/"
# Tweet saved to ./tweets/JoshWComeau - 1213870628895428611.md
```

### Tweet Metrics

If you'd also like to record the number of likes, retweets, and replies the tweet has, pass the `-m` (`--metrics`) flag. This will save those numbers in the frontmatter of the file.

```bash
ttm <tweet url> -m
```

```yaml
---
author: Josh ✨
handle: @JoshWComeau
likes: 993
retweets: 163
replies: 24
---
```

### Save Images Locally

Want to really capture the entire tweet locally? You can pass the `-a` (`--assets`) flag to download all the tweet images as well, instead of just linking to the images on the web. If the tweet is ever deleted or Twitter is unavailable, you'll still have your note.

```bash
ttm <tweet url> -a
```

Tweet images will be automatically saved to `./tweet-assets`. If you'd like to save the assets to a custom directory, use the `--assets-path` flag and pass in the directory.

```bash
ttm <tweet url> -a --assets-path "./images"
```

Nota bene: Unfortunately, there is currently not a way to save gifs or videos from tweets using the v2 API.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch ( `git checkout -b feature` )
3. Commit your Changes ( `git commit -m "Add a cool feature"` )
4. Push to the Branch ( `git push origin feature` )
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [ `LICENSE` ](LICENSE) file for details

<!-- CONTACT -->

## Contact

Karey Higuera - [@kbravh](https://twitter.com/kbravh) - karey.higuera@gmail.com

Project Link: [https://github.com/kbravh/tweet-to-markdown](https://github.com/kbravh/tweet-to-markdown)

<!-- MARKDOWN LINKS -->

[issues-shield]: https://img.shields.io/github/issues/kbravh/tweet-to-markdown.svg?style=flat-square
[issues-url]: https://github.com/kbravh/tweet-to-markdown/issues
[license-shield]: https://img.shields.io/github/license/kbravh/tweet-to-markdown.svg?style=flat-square
[license-url]: https://github.com/kbravh/tweet-to-markdown/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/kbravh
[stars-shield]: https://img.shields.io/github/stars/kbravh/tweet-to-markdown.svg?style=flat-square
[stars-url]: https://github.com/kbravh/tweet-to-markdown/stargazers
