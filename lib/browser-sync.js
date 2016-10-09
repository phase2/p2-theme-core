'use strict';
const browserSync = require('browser-sync').create('server');
const path = require('path');
const _ = require('lodash');

module.exports = (gulp, config, tasks) => {
  const watchFiles = [];
  if (config.css.enabled) {
    watchFiles.push(path.join(config.css.dest, '*.css'));
  }
  if (config.browserSync.watchFiles) {
    config.browserSync.watchFiles.forEach((file) => {
      watchFiles.push(file);
    });
  }
  const options = {
    browser: config.browserSync.browser,
    files: watchFiles,
    port: config.browserSync.port,
    tunnel: config.browserSync.tunnel,
    open: config.browserSync.openBrowserAtStart,
    reloadOnRestart: true,
    reloadDelay: config.browserSync.reloadDelay,
    reloadDebounce: config.browserSync.reloadDebounce,
    // https://www.browsersync.io/docs/options#option-rewriteRules
    rewriteRules: config.browserSync.rewriteRules || [],
    // placing at `</body>` instead of `<body>`
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: (snippet, match) => snippet + match,
      },
    },
    notify: {
      styles: [
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
        'text-align: center',
      ],
    },
  };
  if (config.browserSync.domain) {
    _.merge(options, {
      proxy: config.browserSync.domain,
      startPath: config.browserSync.startPath,
      serveStatic: config.browserSync.serveStatic || [],
    });
  } else {
    _.merge(options, {
      server: {
        baseDir: config.browserSync.baseDir,
      },
      startPath: config.browserSync.startPath,
    });
  }

  function serve() {
    return browserSync.init(options);
  }
  serve.description = 'Create a local server using BrowserSync';
  gulp.task('serve', serve);
  tasks.default.push('serve');
};
