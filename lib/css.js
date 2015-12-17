'use strict';
var cssGlobbing = require('gulp-css-globbing');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
var cached = require('gulp-cached');
var autoprefixer = require('autoprefixer');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');

module.exports = function (gulp, config, tasks) {
  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function (x) {
      return x;
    };
  }

  gulp.task('css', function () {
    return gulp.src(config.css.src)
        .pipe(cssGlobbing({
          extensions: ['.css', '.scss']
        }))
        .pipe(plumber({
          errorHandler: function(error) {
            notify.onError({
              title: 'CSS <%= error.name %> - Line <%= error.line %>',
              message: '<%= error.message %>'
            })(error);
            this.emit('end');
          }
        }))
        .pipe(sourcemaps.init({
          debug: config.debug
        }))
        .pipe(sass({
          outputStyle: 'expanded',
          sourceComments: config.css.sourceComments
        }).on('error', sass.logError))
        .pipe(postcss(
          [
            autoprefixer({
              browsers: config.css.autoPrefixerBrowsers
            })
          ]
        ))
        .pipe(sourcemaps.write((config.css.sourceMapEmbed) ? null : './'))
        .pipe(gulp.dest(config.css.dest))
        .pipe(gulpif(config.browserSync.enabled, reload({stream: true})));
  });

  gulp.task('watch:css', ['css'], function () {
    return gulp.watch(config.css.src, [
      'css',
      'validate:css'
    ]);
  });

  gulp.task('validate:css', function () {
    return gulp.src(config.css.src)
        .pipe(cached('validate:css'))
        .pipe(sassLint())
        .pipe(sassLint.format());
  });

  tasks.watch.push('watch:css');
  tasks.compile.push('css');
  tasks.validate.push('validate:css');

};
