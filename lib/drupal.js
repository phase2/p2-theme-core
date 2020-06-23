const browserSync = require('browser-sync');
const core = require('./core');

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
    gulp.watch(config.drupal.watch, clearDrupalCache);
  });
  tasks.watch.push('watch:drupal');
};
