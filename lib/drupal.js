'use strict';
var exec = require('child_process').execSync;

function sh(cmd) {
  console.log(exec(cmd, {encoding: 'utf8'}));
}
module.exports = function (gulp, config, tasks) {

  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function(x) {return x;};
  }
  
  gulp.task('watch:drupal', function() {
    gulp.watch(config.drupal.watch, function() {
      sh('cd ' + config.drupal.dir + ' && ' + config.drupal.command);
      reload();
    });
  });

  tasks.watch.push('watch:drupal');

};
