
module.exports = function(eleventyConfig) {

  const { imageShortcode } = require("./_data/image.js");
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);
  

  // Passthrough copy for landing_pages
  eleventyConfig.addPassthroughCopy("landing_pages");
  eleventyConfig.addPassthroughCopy("images");

  // Add a collection for blog posts
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("posts/*.md");
  });

  return {
    dir: {
      input: 'pages',
      includes: '../_includes', // Change this line to point to the correct _includes folder
      output: "_site"
    },
    passthroughFileCopy: true,
  };
};
