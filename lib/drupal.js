'use strict';
var exec = require('child_process').execSync;
var inject = require('gulp-inject');
var path = require('path');
var bowerFiles = require('main-bower-files');
var _ = require('lodash');

function sh(cmd) {
  console.log(exec(cmd, {
    encoding: 'utf8'
  }));
}
module.exports = function(gulp, config, tasks) {

  gulp.task('watch:drupal', function watchDrupal() {
    gulp.watch(config.drupal.watch, function() {
      sh('cd ' + config.drupal.dir + ' && ' + config.drupal.command);
      require('browser-sync').get('server').reload();
    });
  });

  tasks.watch.push('watch:drupal');
};
