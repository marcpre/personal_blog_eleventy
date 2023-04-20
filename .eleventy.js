module.exports = function(eleventyConfig) {
    // Add a collection for blog posts
    eleventyConfig.addCollection("posts", function(collection) {
      return collection.getFilteredByGlob("posts/*.md");
    });
  
    return {
      dir: {
        input: ".",
        includes: "_includes",
        output: "_site"
      },
      passthroughFileCopy: true,
    };
  };
  