'use strict';
var gulp = require('gulp');
var cached = require('gulp-cached');
var eslint = require('gulp-eslint');
var gulpif = require('gulp-if');
module.exports = function (gulp, config, tasks) {

  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function(x) {return x;};
  }

  gulp.task('eslint', function () {
    return gulp.src(config.js.src)
      .pipe(gulpif(config.browserSync.enabled, reload({stream: true})))
      .pipe(cached('js'))
      .pipe(eslint())
      .pipe(eslint.format());
  });
  
  gulp.task('watch:js', function() {
    return gulp.watch(config.js.src, [
      'eslint'
    ]);
  });

  tasks.watch.push('watch:js');
  tasks.validate.push('eslint');

};
