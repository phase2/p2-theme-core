'use strict';
var gulp = require('gulp');
var cssGlobbing = require('gulp-css-globbing');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
var cached = require('gulp-cached');
var autoprefixer = require('autoprefixer');

module.exports = function (gulp, config, tasks) {
  
  gulp.task('css', function () {
    return gulp.src(config.css.src)
        .pipe(cssGlobbing({
          extensions: ['.css', '.scss']
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
        .pipe(gulp.dest(config.css.dest));
  });

  gulp.task('watch:css', ['css'], function () {
    return gulp.watch(config.css.src, [
      'css',
      'csslint'
    ]);
  });

  gulp.task('csslint', function () {
    return gulp.src(config.css.src)
        .pipe(cached('csslint'))
        .pipe(sassLint())
        .pipe(sassLint.format());
  });

  tasks.watch.push('watch:css');
  tasks.compile.push('css');
  tasks.validate.push('csslint');

};
