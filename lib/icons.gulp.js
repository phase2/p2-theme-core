'use strict';
var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var runTimestamp = Math.round(Date.now() / 1000);
var gulpif = require('gulp-if');

module.exports = function (gulp, config, tasks) {
  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function(x) {return x;};
  }

  gulp.task('icons', function () {
    return gulp.src(config.icons.src)
        .pipe(iconfont({
          fontName: 'icons',
          appendUniconde: true,
          formats: config.icons.formats,
          timestamp: runTimestamp,
          autohint: config.icons.autohint,
          normalize: config.icons.normalize
        }))
        .on('glyphs', function (glyphs, options) {
          //console.log(glyphs, options);
          gulp.src(config.icons.templates.css.src)
              .pipe(consolidate('lodash', {
                glyphs: glyphs.map(function (glyph) {
                  return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()}
                }),
                fontName: 'icons',
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix
              }))
              .pipe(gulp.dest(config.icons.templates.css.dest));

          gulp.src(config.icons.templates.demo.src)
              .pipe(consolidate('lodash', {
                glyphs: glyphs.map(function (glyph) {
                  return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()}
                }),
                fontName: 'icons',
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix
              }))
              .pipe(gulp.dest(config.icons.templates.demo.dest));
        })
        .pipe(gulp.dest(config.icons.dest))
        .pipe(gulpif(config.browserSync.enabled, reload({stream: true})));
  });

  gulp.task('watch:icons', ['icons'], function () {
    return gulp.watch(config.icons.src, [
      'icons'
    ]);
  });

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');

};
