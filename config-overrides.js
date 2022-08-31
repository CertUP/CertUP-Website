// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
//import webpack from 'webpack';

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
  });
  config.resolve.fallback = fallback;
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf instanceof Array) {
      return {
        ...rule,
        // create-react-app let every file which doesn't match to any filename test falls back to file-loader,
        // so we need to add purs-loader before that fallback.
        // see: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js#L220-L236
        oneOf: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false
            },
          },
          ...rule.oneOf
        ]
      };
    }

    return rule;
  });
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
