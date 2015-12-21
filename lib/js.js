'use strict';
var cached = require('gulp-cached');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

module.exports = function (gulp, config, tasks) {
  
  config.js.dest = config.js.dest || config.js.destDir;

  gulp.task('validate:js', 'Lint JS using ESlint', function () {
    return gulp.src(config.js.src)
        .pipe(cached('js'))
        .pipe(eslint())
        .pipe(eslint.format());
  });

  gulp.task('js', 'Transpile JS using Babel, concat and uglify.', function () {
    var stream = gulp.src(config.js.src)
        .pipe(sourcemaps.init());
    if (config.js.babel) {
      stream.pipe(babel()); // all babel options handled in `.babelrc`
    }
    stream.pipe(concat(config.js.destName))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.js.dest));
    if (config.browserSync.enabled) {
      stream.pipe(require('browser-sync').get('server').reload({stream: true}));
    }
    return stream;
  });

  gulp.task('watch:js', function () {
    return gulp.watch(config.js.src, [
      'js',
      'validate:js'
    ]);
  });

  tasks.compile.push('js');
  tasks.watch.push('watch:js');
  tasks.validate.push('validate:js');

};
