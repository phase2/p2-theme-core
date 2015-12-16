'use strict';
module.exports = function (gulp, config, tasks) {
  if (config.browserSync.enabled) {
    require('./lib/browser-sync.js')(gulp, config, tasks);
  }

  if (config.js.enabled) {
    require('./lib/js.js')(gulp, config, tasks);
  }

  if (config.css.enabled) {
    require('./lib/css.js')(gulp, config, tasks);
  }

  if (config.icons.enabled) {
    require('./lib/icons.js')(gulp, config, tasks);
  }

  if (config.patternLab.enabled) {
    require('./lib/pattern-lab.js')(gulp, config, tasks);
  }
};
