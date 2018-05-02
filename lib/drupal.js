'use strict';
const core = require('./core');
const browserSync = require('browser-sync');

module.exports = (gulp, config, tasks) => {
  function clearDrupalCache(done) {
    core.sh(`cd ${config.drupal.dir} && ${config.drupal.command}`, true, () => {
      if (config.browserSync.enabled) {
        browserSync.get('server').reload();
      }
      done();
    });
  }

  clearDrupalCache.description = 'Clear Drupal Cache';

  gulp.task('cc', clearDrupalCache);

  gulp.task('watch:drupal', () => {
    gulp.watch(config.drupal.watch, config.watch.options, clearDrupalCache);
  });
  tasks.watch.push('watch:drupal');
};
