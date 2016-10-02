'use strict';
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var del = require('del');
var _ = require('lodash');
var runTimestamp = Math.round(Date.now() / 1000);

// Startup check to avoid multiple dependency runs
var isStartup = require('./startup').isStartup;
var ranOnce = false;

module.exports = function (gulp, config, tasks) {
  var iconName = 'icons'; // @todo make configurable
  // Use custom template delimiters of `{{` and `}}`.
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  // Use custom evaluate delimiters of `{%` and `%}`.
  _.templateSettings.evaluate = /{%([\s\S]+?)%}/g;

  function icons(done) {
    var stream = gulp.src(config.icons.src)
          .pipe(iconfont({
            fontName: iconName,
            appendUniconde: true,
            formats: config.icons.formats,
            timestamp: config.icons.useTimestamp ? runTimestamp : 0,
            autohint: config.icons.autohint,
            normalize: config.icons.normalize
          }));
    stream.pipe(gulp.dest(config.icons.dest));
    if (config.browserSync.enabled) {
      require('browser-sync').get('server').reload();
    }
    if (config.icons.templates.enabled) {
      stream.on('glyphs', function (glyphs) {
              //console.log(glyphs, options);
        gulp.src(config.icons.templates.css.src)
                  .pipe(consolidate('lodash', {
                    glyphs: glyphs.map(function (glyph) {
                      return {name: glyph.name, content: glyph.unicode[0].toString(16).toUpperCase()};
                    }),
                    fontName: iconName,
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
                            fontName: iconName,
                            fontPath: config.icons.fontPathPrefix,
                            classNamePrefix: config.icons.classNamePrefix
                          }))
                          .pipe(gulp.dest(config.icons.templates.demo.dest))
                          .on('end', function () {
                            done();
                          });
                  });
      });
    } else {
      done();
    }
  }

  icons.description = 'Build font icons from SVG files';

  gulp.task('icons', function fullIcons(done) {
    // This task should only run once on startup, no matter the dependency
    if (isStartup() && ranOnce)  {
      console.info('Task icons called multiple times on startup as dependency of other tasks. Deferring.');
      done();
      return;
    }
    icons(done);
    ranOnce = true;
  });

  function watchIcons() {
    var src = [config.icons.src];
    if (config.icons.templates.enabled) {
      src.push(config.icons.templates.css.src);
      src.push(config.icons.templates.demo.src);
    }
    return gulp.watch(src, icons);
  }

  watchIcons.description = 'Watch icons';

  gulp.task('watch:icons', watchIcons);

  function cleanIcons(done) {
    var toClean = [config.icons.dest + iconName + '.*'];
    if (config.icons.templates.enabled) {
      var cssTemplateFilename = _.last(config.icons.templates.css.src.split('/'));
      var demoTemplateFilename = _.last(config.icons.templates.demo.src.split('/'));
      toClean.push(config.icons.templates.css.dest + cssTemplateFilename);
      toClean.push(config.icons.templates.demo.dest + demoTemplateFilename);
    }
    del(toClean).then(function() {
      done();
    });
  }

  cleanIcons.description = 'Delete compiled icon files and template files';

  gulp.task('clean:icons', cleanIcons);

  tasks.watch.push('watch:icons');
  tasks.compile.push('icons');
  tasks.clean.push('clean:icons');

};
