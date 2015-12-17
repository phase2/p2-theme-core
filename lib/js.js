'use strict';
var cached = require('gulp-cached');
var eslint = require('gulp-eslint');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

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

  gulp.task('js', function() {
    return gulp.src(config.js.src)
      .pipe(sourcemaps.init())
      .pipe(babel()) // all babel options handled in `.babelrc`
      .pipe(concat(config.js.destName))
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.js.destDir));
  });
  
  gulp.task('watch:js', function() {
    return gulp.watch(config.js.src, [
      'js',
      'eslint'
    ]);
  });

  tasks.watch.push('watch:js');
  tasks.validate.push('eslint');

};
