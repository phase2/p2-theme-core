'use strict';
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var runTimestamp = Math.round(Date.now() / 1000);

module.exports = function (gulp, config, tasks) {

  gulp.task('icons', 'Build font icons from SVG files', function (done) {
    var stream = gulp.src(config.icons.src)
        .pipe(iconfont({
          fontName: 'icons',
          appendUniconde: true,
          formats: config.icons.formats,
          timestamp: runTimestamp,
          autohint: config.icons.autohint,
          normalize: config.icons.normalize
        }));
    if (!config.icons.templates.enabled) {
      stream.pipe(gulp.dest(config.icons.dest))
        .on('end', function () {
          if (config.browserSync.enabled) {
            stream.pipe(require('browser-sync').get('server').reload({stream: true}));
          }
          done();
        });
    } else {
      stream.on('glyphs', function (glyphs) {
        //console.log(glyphs, options);
        gulp.src(config.icons.templates.css.src)
          .pipe(consolidate('lodash', {
            glyphs: glyphs.map(function (glyph) {
              return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()};
            }),
            fontName: 'icons',
            fontPath: config.icons.fontPathPrefix,
            classNamePrefix: config.icons.classNamePrefix
          }))
          .pipe(gulp.dest(config.icons.templates.css.dest))
          .on('end', function () {
            gulp.src(config.icons.templates.demo.src)
              .pipe(consolidate('lodash', {
                glyphs: glyphs.map(function (glyph) {
                  return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()};
                }),
                fontName: 'icons',
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix
              }))
              .pipe(gulp.dest(config.icons.templates.demo.dest))
              .on('end', function () {
                done();
              });
          });
      });
    }
  });

  gulp.task('watch:icons', function () {
    var src = [config.icons.src];
    if (config.icons.templates.enabled) {
      src.push(config.icons.templates.css.src);
      src.push(config.icons.templates.demo.src);
    }
    return gulp.watch(src, [
      'icons'
    ]);
  });

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');

};
