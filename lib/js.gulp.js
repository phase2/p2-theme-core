'use strict';
var gulp = require('gulp');
var cached = require('gulp-cached');
var eslint = require('gulp-eslint');
module.exports = function (gulp, config, tasks) {

  gulp.task('eslint', function () {
    return gulp.src(config.js.src)
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
