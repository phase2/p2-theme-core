'use strict';
const iconfont = require('gulp-iconfont');
const consolidate = require('gulp-consolidate');
const del = require('del');
const _ = require('lodash');
const browserSync = require('browser-sync');

const runTimestamp = Math.round(Date.now() / 1000);

module.exports = (gulp, config, tasks) => {
  const iconName = 'icons'; // @todo make configurable
  // Use custom template delimiters of `{{` and `}}`.
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  // Use custom evaluate delimiters of `{%` and `%}`.
  _.templateSettings.evaluate = /{%([\s\S]+?)%}/g;

  function icons(done) {
    const stream = gulp.src(config.icons.src)
      .pipe(iconfont({
        fontName: iconName,
        appendUniconde: true,
        formats: config.icons.formats,
        timestamp: config.icons.useTimestamp ? runTimestamp : 0,
        autohint: config.icons.autohint,
        normalize: config.icons.normalize,
      }));
    stream.pipe(gulp.dest(config.icons.dest));
    if (config.browserSync.enabled) {
      browserSync.get('server').reload();
    }
    if (config.icons.templates.enabled) {
      stream.on('glyphs', (glyphs) => {
        // console.log(glyphs, options);
        gulp.src(config.icons.templates.css.src)
          .pipe(consolidate('lodash', {
            glyphs: glyphs.map((glyph) => {
              const glyphUnicode = glyph.unicode[0].toString(16).toUpperCase();
              return {
                name: glyph.name,
                content: glyphUnicode,
              };
            }),
            fontName: iconName,
            fontPath: config.icons.fontPathPrefix,
            classNamePrefix: config.icons.classNamePrefix,
          }))
          .pipe(gulp.dest(config.icons.templates.css.dest))
          .on('end', () => {
            gulp.src(config.icons.templates.demo.src)
              .pipe(consolidate('lodash', {
                glyphs: glyphs.map((glyph) => {
                  const glyphUnicode = glyph.unicode[0].toString(16).toUpperCase();
                  return {
                    name: glyph.name,
                    content: glyphUnicode,
                  };
                }),
                fontName: iconName,
                fontPath: config.icons.fontPathPrefix,
                classNamePrefix: config.icons.classNamePrefix,
              }))
              .pipe(gulp.dest(config.icons.templates.demo.dest))
              .on('end', () => {
                done();
              });
          });
      });
    } else {
      done();
    }
  }

  icons.description = 'Build font icons from SVG files';

  gulp.task('icons', icons);

  function watchIcons() {
    const src = [config.icons.src];
    if (config.icons.templates.enabled) {
      src.push(config.icons.templates.css.src);
      src.push(config.icons.templates.demo.src);
    }
    return gulp.watch(src, icons);
  }

  watchIcons.description = 'Watch icons';

  gulp.task('watch:icons', watchIcons);

  function cleanIcons(done) {
    const toClean = [`${config.icons.dest}${iconName}.*`];

    if (config.icons.templates.enabled) {
      const cssTemplateFilename = _.last(config.icons.templates.css.src.split('/'));
      const demoTemplateFilename = _.last(config.icons.templates.demo.src.split('/'));
      toClean.push(`${config.icons.templates.css.dest}${cssTemplateFilename}`);
      toClean.push(`${config.icons.templates.demo.dest}${demoTemplateFilename}`);
    }

    del(toClean).then(() => {
      done();
    });
  }

  cleanIcons.description = 'Delete compiled icon files and template files';

  gulp.task('clean:icons', cleanIcons);

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');
  tasks.clean.push('clean:icons');
};
