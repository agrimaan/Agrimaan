/** @type {import('@craco/craco').CracoConfig} */
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Avoid eval-based sourcemaps that violate CSP
        webpackConfig.devtool = "source-map"; // or "cheap-source-map"
        return webpackConfig;
      },
    },
  };
  