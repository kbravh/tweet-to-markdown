/**
 * Parses out the tweet ID from the URL or ID that the user provided
 * @param {options} options - The parsed command line arguments
 */
const getTweetID = ({src}) => {
  let id
  try {
    // Create a URL object with the source. If it fails, it's not a URL.
    let url = new URL(src)
    id = url.pathname.split('/').slice(-1)[0]
  } catch (error) {
    id = src
  }
  return id
}

module.exports = {
  getTweetID
}