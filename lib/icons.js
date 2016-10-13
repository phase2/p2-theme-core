'use strict';
const iconfont = require('gulp-iconfont');
const del = require('del');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync');

const runTimestamp = Math.round(Date.now() / 1000);

module.exports = (gulp, config, tasks) => {
  const iconName = config.icons.iconName || 'icons';
  // Use custom template delimiters of `{{` and `}}`.
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  // Use custom evaluate delimiters of `{%` and `%}`.
  _.templateSettings.evaluate = /{%([\s\S]+?)%}/g;

  /**
   * Build font icons from SVG files and optionally make scss and demo templates.
   * @param done {function} - Callback when all done.
   */
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
        // console.log(glyphs);
        const iconData = {
          glyphs: glyphs.map(glyph => ({ // returns the object
            name: glyph.name,
            content: glyph.unicode[0].toString(16).toUpperCase(),
          })),
          fontName: iconName,
          fontPath: config.icons.fontPathPrefix,
          classNamePrefix: config.icons.classNamePrefix,
        };

        /**
         * Process Icon Templates
         * @param srcFile {string} - Path to lodash template file.
         * @param destDir {string} - Path to write processed file to.
         * @param cb {function} - Callback for when done.
         */
        function processIconTemplate(srcFile, destDir, cb) {
          fs.readFile(srcFile, 'utf8', (err, srcFileContents) => {
            if (err) throw err;
            const result = _.template(srcFileContents)(iconData);
            const destFile = path.join(destDir, path.basename(srcFile));
            fs.writeFile(destFile, result, cb);
          });
        }

        // Process sass template
        processIconTemplate(config.icons.templates.css.src, config.icons.templates.css.dest, () => {
          // Then process demo (twig) template. Then say we are `done()`
          processIconTemplate(
            config.icons.templates.demo.src,
            config.icons.templates.demo.dest,
            done
          );
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
    const toClean = [path.join(config.icons.dest, `${iconName}.*`)];

    if (config.icons.templates.enabled) {
      const cssTemplateFilename = _.last(config.icons.templates.css.src.split('/'));
      const demoTemplateFilename = _.last(config.icons.templates.demo.src.split('/'));
      toClean.push(`${config.icons.templates.css.dest}${cssTemplateFilename}`);
      toClean.push(`${config.icons.templates.demo.dest}${demoTemplateFilename}`);
    }

    del(toClean, { force: true }).then(() => {
      done();
    });
  }

  cleanIcons.description = 'Delete compiled icon files and template files';

  gulp.task('clean:icons', cleanIcons);

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');
  tasks.clean.push('clean:icons');
};
