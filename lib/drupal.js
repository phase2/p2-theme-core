const exec = require('child_process').execSync;
const browserSync = require('browser-sync');

module.exports = (gulp, config, tasks) => {
  function sh(cmd) {
    console.log(exec(cmd, {
      encoding: 'utf8',
    }));
  }

  gulp.task('watch:drupal', () => {
    gulp.watch(config.drupal.watch, () => {
      sh(`cd ${config.drupal.dir} && ${config.drupal.command}`);
      browserSync.get('server').reload();
    });
  });

  tasks.watch.push('watch:drupal');
};
