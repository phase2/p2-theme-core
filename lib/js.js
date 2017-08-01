'use strict';
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const cached = require('gulp-cached');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync');

module.exports = (gulp, config, tasks) => {
  function validateJs() {
    return gulp.src(config.js.eslint.src)
      .pipe(cached('validate:js'))
      .pipe(eslint())
      .pipe(eslint.format());
  }

  validateJs.description = 'Lint JS.';

  if (config.js.eslint.enabled) {
    gulp.task('validate:js', () => validateJs().pipe(eslint.failAfterError()));
    tasks.validate.push('validate:js');
    gulp.task('watch:validate:js', () => gulp.watch(config.js.eslint.src, validateJs));
    tasks.watch.push('watch:validate:js');
  }

  function compileJs(done) {
    gulp.src(config.js.src)
      .pipe(sourcemaps.init())
      .pipe(gulpif(config.js.babel, babel())) // all babel options handled in `.babelrc`
      .pipe(concat(config.js.destName))
      .pipe(gulpif(config.js.uglify, uglify()))
      .pipe(sourcemaps.write((config.js.sourceMapEmbed) ? null : './'))
      .pipe(gulp.dest(config.js.dest))
      .on('end', () => {
        if (config.browserSync.enabled) {
          browserSync.get('server').reload();
        }
        done();
      });
  }

  compileJs.description = 'Transpile JS using Babel, concat and uglify.';

  gulp.task('js', compileJs);

  gulp.task('watch:js', () => gulp.watch(config.js.src, compileJs));

  gulp.task('clean:js', (done) => {
    del([
      `${config.js.dest}*.{js,js.map}`,
    ], { force: true }).then(() => {
      done();
    });
  });

  tasks.clean.push('clean:js');
  tasks.compile.push('js');
  tasks.watch.push('watch:js');
};
