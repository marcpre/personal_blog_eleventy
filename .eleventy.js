module.exports = function (eleventyConfig) {
    eleventyConfig.setTemplateFormats(["md", "html"]);

    // Copy static files to output folder
    eleventyConfig.addPassthroughCopy('src/images');
    eleventyConfig.addPassthroughCopy('src/css');
    eleventyConfig.addPassthroughCopy('src/js');

    // Set input and output folders
    return {
        dir: {
            input: '_src',
            output: '_site',
            includes: '_includes',
            layouts: '_layouts'
        }
    };
};
