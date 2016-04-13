'use strict';
var fs = require('fs');
var yaml = require('js-yaml');
var _ = require('lodash');

module.exports = function (gulp, config, tasks) {
  var defaultConfig = yaml.safeLoad(fs.readFileSync(__dirname + '/config.default.yml', 'utf8'));
  config = _.merge(defaultConfig, config);
  
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
    if (config.patternLab.engine && config.patternLab.engine === 'php-twig') {
      require('./lib/pattern-lab--php-twig.js')(gulp, config, tasks);
    } else {
      require('./lib/pattern-lab.js')(gulp, config, tasks);
    }
  }

  if (config.drupal.enabled) {
    require('./lib/drupal.js')(gulp, config, tasks);
  }
};
