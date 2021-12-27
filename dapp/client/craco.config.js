// This file is to polyfill multiple node-specific packages (dependencies of `web3`) for the browser
//
// Using the `NodePolyfillPlugin` directly, i.e:
//    const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
//    webpackConfig.plugins.push(new NodePolyfillPlugin());
// Results into:
//  - Uncaught Error: Cannot find module 'node_modules/console-browserify/index.js'
//  - AND does NOT polyfill node's global variable `Buffer`

// Ref: npm package: 'node-polyfill-webpack-plugin'
const NODE_ALIASES = {
  assert: require.resolve('assert/'),
  buffer: require.resolve('buffer/'),
  // console: require.resolve('console-browserify'), // avoiding Uncaught Error
  constants: require.resolve('constants-browserify'),
  crypto: require.resolve('crypto-browserify'),
  domain: require.resolve('domain-browser'),
  events: require.resolve('events/'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  path: require.resolve('path-browserify'),
  punycode: require.resolve('punycode/'),
  process: require.resolve('process/browser'),
  querystring: require.resolve('querystring-es3'),
  stream: require.resolve('stream-browserify'),
  sys: require.resolve('util/'),
  timers: require.resolve('timers-browserify'),
  tty: require.resolve('tty-browserify'),
  url: require.resolve('url/'),
  util: require.resolve('util/'),
  vm: require.resolve('vm-browserify'),
  zlib: require.resolve('browserify-zlib'),
};

// Ref: https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Adding aliases of node-specific packages
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = NODE_ALIASES;

      // Providing global `Buffer` object (from `buffer` pkg), as it is needed from `web3`
      const { ProvidePlugin } = require('webpack');
      webpackConfig.plugins.push(
        new ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })
      );

      // silenting unnecessary "22 warnings" of loading source maps of `web3` and its deps: https://stackoverflow.com/q/63195843/2743887
      webpackConfig.ignoreWarnings = webpackConfig.ignoreWarnings || [];
      webpackConfig.ignoreWarnings.push(/Failed to parse source map/);

      return webpackConfig;
    },
  },
};
