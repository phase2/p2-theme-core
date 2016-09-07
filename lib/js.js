'use strict';
var cached = require('gulp-cached');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var gulpif = require('gulp-if');
var del = require('del');

module.exports = function (gulp, config, tasks) {

  config.js.dest = config.js.dest || config.js.destDir;

  gulp.task('validate:js', function () {
    return gulp.src(config.js.src)
    .pipe(cached('js'))
    .pipe(eslint())
    .pipe(eslint.format());
  });

  gulp.task('js', function (done) {
    gulp.src(config.js.src)
    .pipe(sourcemaps.init())
    .pipe(gulpif(config.js.babel, babel())) // all babel options handled in `.babelrc`
    .pipe(concat(config.js.destName))
    .pipe(gulpif(config.js.uglify, uglify()))
    .pipe(sourcemaps.write((config.js.sourceMapEmbed) ? null : './'))
    .pipe(gulp.dest(config.js.dest))
    .on('end', function () {
      if (config.browserSync.enabled) {
        require('browser-sync').get('server').reload();
      }
      done();
    });
  });

  gulp.task('watch:js', function () {
    return gulp.watch(config.js.src, gulp.parallel(
      'js',
      'validate:js'
    ));
  });

  gulp.task('clean:js', function (done) {
    del([
      config.js.dest + '*.{js,js.map}'
    ]).then(function () {
      done();
    });
  });

  tasks.clean.push('clean:js');
  tasks.compile.push('js');
  tasks.watch.push('watch:js');
  tasks.validate.push('validate:js');

};
