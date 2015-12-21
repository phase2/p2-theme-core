'use strict';
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
var cached = require('gulp-cached');
var autoprefixer = require('autoprefixer');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');

module.exports = function (gulp, config, tasks) {
  
  function cssCompile() {
    var stream = gulp.src(config.css.src);
    
    if (config.css.sassdoc && config.css.sassdoc.enabled) {
      stream.pipe(sassdoc({
        src: config.css.src,
        dest: config.css.sassdoc.dest,
        verbose: config.css.sassdoc.verbose
      }));
    }
    stream.pipe(sassGlob())
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
          sourceComments: config.css.sourceComments,
          includePaths: config.css.includePaths
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
    if (config.browserSync.enabled) {
      stream.pipe(require('browser-sync').get('server').reload({stream: true}));
    }
    
    return stream;
  }
  
  gulp.task('css', 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps', cssCompile);

  gulp.task('watch:css', function () {
    return gulp.watch(config.css.src, [
      'css',
      'validate:css'
    ]);
  });

  gulp.task('validate:css', 'Lint Scss files', function () {
    return gulp.src(config.css.src)
        .pipe(cached('validate:css'))
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
  });

  if (config.icons.enabled) {
    gulp.task('css:full', false, ['icons'], cssCompile);
    tasks.compile.push('css:full');
  } else {
    tasks.compile.push('css');
  }
  tasks.watch.push('watch:css');
  tasks.validate.push('validate:css');

};
