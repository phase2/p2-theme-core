'use strict';
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
      'css'
    ]);
  });
  
  tasks.watch.push('watch:css');
  tasks.compile.push('css');
  tasks.validate.push('scsslint');

};
