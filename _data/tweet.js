const fetch = require("node-fetch");

async function getTweetEmbed(url) {
  const apiUrl = new URL("https://publish.twitter.com/oembed");
  apiUrl.searchParams.set("url", url);

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();
    return json.html;
  } catch (error) {
    console.error("Error fetching tweet embed:", error);
    return "";
  }
}

module.exports = { getTweetEmbed };
