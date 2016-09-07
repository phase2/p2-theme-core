'use strict';
var browserSync = require('browser-sync').create('server');
var path = require('path');
var _ = require('lodash');

module.exports = function(gulp, config, tasks) {
  var watchFiles = [];
  if (config.css.enabled) {
    watchFiles.push(path.join(config.css.dest, '*.css'));
  }
  if (config.browserSync.watchFiles) {
    config.browserSync.watchFiles.forEach(function(file) {
      watchFiles.push(file);
    });
  }
  var options = {
    browser: config.browserSync.browser,
    files: watchFiles,
    port: config.browserSync.port,
    tunnel: config.browserSync.tunnel,
    open: config.browserSync.openBrowserAtStart,
    reloadDelay: config.browserSync.reloadDelay,
    reloadDebounce: config.browserSync.reloadDebounce,
    notify: {
      styles:  [
        'display: none',
        'padding: 15px',
        'font-family: sans-serif',
        'position: fixed',
        'font-size: 0.9em',
        'z-index: 9999',
        'bottom: 0px',
        'right: 0px',
        'border-bottom-left-radius: 5px',
        'background-color: #1B2032',
        'margin: 0',
        'color: white',
        'text-align: center'
      ]
    }
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
  gulp.task('serve', function serve() {
    return browserSync.init(options);
  });
  tasks.default.push('serve');
};