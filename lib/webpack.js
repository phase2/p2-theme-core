'use strict';
const webpack = require('webpack');
const browserSync = require('browser-sync');
const core = require('./core');

module.exports = (gulp, config, tasks) => {
  if (!config.webpack.config) {
    process.stdout.write(`Config passed in requires WebPack config. Gulpconfig.js file should contain this:
webpack: {
  enabled: true,
  config: require('./webpack.config.js'),
}
    `);
    process.exit(1);
  }

  // Config options - https://webpack.js.org/configuration/
  const webpackConfig = config.webpack.config;
  if (!webpackConfig.plugins) webpackConfig.plugins = [];
  if (typeof webpackConfig.devtool === 'undefined') webpackConfig.devtool = 'cheap-module-source-map';

  function compileWebpack(done) {
    if (process.env.NODE_ENV === 'production') {
      // https://webpack.js.org/guides/production-build/#node-environment-variable
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );

      // Uglify - https://webpack.js.org/guides/production-build/#minification
      webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: webpackConfig.devtool,
        })
      );
    }
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        done(err);
      }

      // Stats config options: https://webpack.js.org/configuration/stats/
      console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true,   // Shows colors in the console
      }));

      done(stats.hasErrors() ? core.error('Webpack Compile Failed.') : null);
    });
  }

  gulp.task('webpack', compileWebpack);

  function watchWebpack(done) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        debug: true,
      })
    );

    webpack(webpackConfig).watch({
    // https://webpack.js.org/configuration/watch/#watchoptions
    }, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        done(err);
      }

      // Stats config options: https://webpack.js.org/configuration/stats/
      console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true,   // Shows colors in the console
      }));

      if (config.browserSync.enabled) browserSync.get('server').reload();
    });
  }

  gulp.task('watch:webpack', watchWebpack);

  tasks.watch.push('watch:webpack');
  tasks.compile.push('webpack');
};
