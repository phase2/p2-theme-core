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

  if (config.webpack.enabled) {
    require('./lib/webpack')(gulp, config, tasks);
  }

  /* eslint-enable global-require */

  // Instead of `gulp.parallel`, which is what is set in Pattern Lab Starter's `gulpfile.js`, this
  // uses `gulp.series`. Needed to help with the Gulp task dependencies lost going from v3 to v4.
  // We basically need icons compiled before CSS & CSS/JS compiled before inject:pl before pl
  // compile. The order of the `require`s above is the order that compiles run in; not perfect, but
  // it works.

  // Users can potentially disable all tasks. This will leave empty task arrays
  // which causes Gulp to kersplode. Add at least one dummy task to the array if
  // it is otherwise empty
  // The major types are: compile, watch, validate, clean, default
  _.forEach(tasks, (value, key) => {
    if (tasks[key].length === 0) {
      // Create a fake task that just signals completion via callback
      gulp.task(`${key} fallback task`, (cb) => { cb(); });
      // Add it on if otherwise empty
      tasks[key].push(`${key} fallback task`);
    }
  });


  // eslint-disable-next-line no-param-reassign
  tasks.compile = gulp.series(tasks.compile);
};
