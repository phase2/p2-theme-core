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

  if (config.icons.enabled) {
    require('./lib/icons.js')(gulp, config, tasks);
  }

  if (config.js.enabled) {
    require('./lib/js.js')(gulp, config, tasks);
  }

  if (config.css.enabled) {
    require('./lib/css.js')(gulp, config, tasks);
  }

  if (config.patternLab.enabled) {
    require('./lib/pattern-lab--php-twig.js')(gulp, config, tasks);
  }

  if (config.drupal.enabled) {
    require('./lib/drupal.js')(gulp, config, tasks);
  }

  // Instead of `gulp.parallel`, which is what is set in Pattern Lab Starter's `gulpfile.js`, this uses `gulp.series`.
  // Needed to help with the Gulp task dependencies lost going from v3 to v4.
  // We basically need icons compiled before CSS & CSS/JS compiled before inject:pl before pl compile.
  // The order of the `require`s above is the order that compiles run in; not perfect, but it works.
  tasks.compile = gulp.series(tasks.compile);

};
