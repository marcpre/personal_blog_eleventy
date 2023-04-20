const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes) {
  let metadata = await Image(src, {
    widths: [300, 600, 900],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/img/",
  });

  const defaultFormat = "jpeg";
  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes, {
    whitespaceMode: "inline",
  });
}

module.exports = { imageShortcode };
