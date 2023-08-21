const webpack = require("webpack")

// https://github.com/timarney/react-app-rewired
// https://stackoverflow.com/questions/68707553/uncaught-referenceerror-buffer-is-not-defined
// https://github.com/facebook/create-react-app/issues/11756
// https://stackoverflow.com/questions/70398678/i-tried-to-polyfill-modules-in-webpack-5-but-not-working-reactjs
module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  }
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]

  return config
}
