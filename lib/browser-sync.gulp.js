'use strict';
var browserSync = require('browser-sync').create('server');
var _ = require('lodash');

module.exports = function(gulp, config, tasks) {
  var options = {
    browser: config.browserSync.browser,
    files: config.browserSync.watchFiles,
    port: config.browserSync.port,
    tunnel: config.browserSync.tunnel,
    open: config.browserSync.openBrowserAtStart,
    reloadDelay: config.browserSync.reloadDelay,
    reloadDebounce: config.browserSync.reloadDebounce
  };
  if (config.browserSync.domain) {
    _.merge(options, {
      proxy: config.browserSync.domain,
      startPath: config.browserSync.startPath
    });
  } else {
    _.merge(options, {
      server: {
        baseDir: config.browserSync.baseDir
      },
      startPath: config.browserSync.startPath
    });
  }
  gulp.task('serve', function() {
    return browserSync.init(options);
  });
  tasks.default.push('serve');
};