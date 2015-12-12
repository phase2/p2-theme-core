'use strict';
//var sass = require('gulp-sass');
//var sourcemaps = require('gulp-sourcemaps');
//var postcss = require('gulp-postcss');
//var autoprefixer = require('autoprefixer-core');
//var cache = require('gulp-cached');
//var scsslint = require('gulp-scss-lint');
//var chalk = require('chalk');

module.exports = function (gulp, plugins, config, tasks) {
  
  gulp.task('css', function () {
    return gulp.src(config.css.src)
        .pipe(plugins.cssGlobbing({
          extensions: ['.css', '.scss']
        }))
        .pipe(plugins.sourcemaps.init({
          debug: config.debug
        }))
        .pipe(plugins.sass({
          outputStyle: 'expanded',
          sourceComments: config.css.sourceComments
        }).on('error', plugins.sass.logError))
        .pipe(plugins.postcss(
            [
              plugins.autoprefixer({
                browsers: config.css.autoPrefixerBrowsers
              })
            ]
        ))
        .pipe(plugins.sourcemaps.write((config.css.sourceMapEmbed) ? null : './'))
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
        .pipe(plugins.cached('csslint'))
        .pipe(plugins.sassLint())
        .pipe(plugins.sassLint.format());
  });

  tasks.watch.push('watch:css');
  tasks.compile.push('css');
  tasks.validate.push('csslint');

};
