'use strict';
var runTimestamp = Math.round(Date.now() / 1000);
module.exports = function (gulp, plugins, config, tasks) {

  gulp.task('icons', function () {
    return gulp.src(config.icons.src)
        .pipe(plugins.iconfont({
          fontName: 'icons',
          appendUniconde: true,
          formats: config.icons.formats,
          timestamp: runTimestamp,
          autohint: config.icons.autohint
        }))
        .on('glyphs', function (glyphs, options) {
          //console.log(glyphs, options);
          gulp.src(config.icons.templates.css.src)
              .pipe(plugins.consolidate('lodash', {
                glyphs: glyphs.map(function (glyph) {
                  return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()}
                }),
                fontName: 'icons',
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix
              }))
              .pipe(gulp.dest(config.icons.templates.css.dest));

          gulp.src(config.icons.templates.demo.src)
              .pipe(plugins.consolidate('lodash', {
                glyphs: glyphs.map(function (glyph) {
                  return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()}
                }),
                fontName: 'icons',
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix
              }))
              .pipe(gulp.dest(config.icons.templates.demo.dest));
        })
        .pipe(gulp.dest(config.icons.dest));
  });

  gulp.task('watch:icons', ['icons'], function () {
    return gulp.watch(config.icons.src, [
      'icons'
    ]);
  });

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');

};
