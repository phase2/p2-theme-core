'use strict';
const _ = require('lodash');
const defaultConfig = require('./config.default');

module.exports = (gulp, userConfig, tasks) => {
  const config = _.merge(defaultConfig, userConfig);

  /* eslint-disable global-require */
  if (config.browserSync.enabled) {
    require('./lib/browser-sync')(gulp, config, tasks);
  }

  if (config.icons.enabled) {
    require('./lib/icons')(gulp, config, tasks);
  }

  if (config.js.enabled) {
    require('./lib/js')(gulp, config, tasks);
  }

  if (config.css.enabled) {
    require('./lib/css')(gulp, config, tasks);
  }

  if (config.patternLab.enabled) {
    require('./lib/pattern-lab--php-twig')(gulp, config, tasks);
  }

  if (config.drupal.enabled) {
    require('./lib/drupal')(gulp, config, tasks);
  }
  /* eslint-enable global-require */

  // Instead of `gulp.parallel`, which is what is set in Pattern Lab Starter's `gulpfile.js`, this
  // uses `gulp.series`. Needed to help with the Gulp task dependencies lost going from v3 to v4.
  // We basically need icons compiled before CSS & CSS/JS compiled before inject:pl before pl
  // compile. The order of the `require`s above is the order that compiles run in; not perfect, but
  // it works.
  // eslint-disable-next-line no-param-reassign
  tasks.compile = gulp.series(tasks.compile);
};
