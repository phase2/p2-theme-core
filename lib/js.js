'use strict';
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var cached = require('gulp-cached');
var gulpif = require('gulp-if');
var del = require('del');

// Startup check to avoid multiple dependency runs
var isStartup = require('./startup').isStartup;
var ranOnce = false;

module.exports = function (gulp, config, tasks) {

  config.js.dest = config.js.dest || config.js.destDir;

  function validateJs() {
    return gulp.src(config.js.eslint.src)
      .pipe(cached('validate:js'))
      .pipe(eslint())
      .pipe(eslint.format());
  }

  validateJs.description = 'Lint JS.';

  gulp.task('validate:js', function() {
    return validateJs().pipe(eslint.failAfterError());
  });

  function compileJs(done) {
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
  }

  compileJs.description = 'Transpile JS using Babel, concat and uglify.';

  gulp.task('js', function fullCompileJs(done) {
    // This task should only run once on startup, no matter the dependency
    if (isStartup() && ranOnce)  {
      console.info('Task js called multiple times on startup as dependency of other tasks. Deferring.');
      done();
      return;
    }
    compileJs(done);
    ranOnce = true;
  });

  gulp.task('watch:js', function () {
    return gulp.watch(config.js.src, gulp.parallel(
      'js',
      validateJs
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
