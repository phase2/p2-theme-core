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
  
  function cssCompile(done) {
    var stream = gulp.src(config.css.src);
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
      if (config.css.sassdoc && config.css.sassdoc.enabled) {
        stream = sassDoc(stream);
      }
      stream.on('end', function () {
        done();
      });
  }

  function sassDoc(stream) {
    var sassdoc = require('sassdoc');
    var sassdocOptions = {};
    if (config.css.sassdoc.dest) {
      sassdocOptions.dest = config.css.sassdoc.dest;
    }
    if (config.css.sassdoc.verbose) {
      sassdocOptions.verbose = config.css.sassdoc.verbose;
    }
    if (config.css.sassdoc.basePath) {
      sassdocOptions.basePath = config.css.sassdoc.basePath;
    }
    if (config.css.sassdoc.exclude) {
      sassdocOptions.exclude = config.css.sassdoc.exclude;
    }
    if (config.css.sassdoc.theme) {
      sassdocOptions.theme = config.css.sassdoc.theme;
    }
    if (config.css.sassdoc.sort) {
      sassdocOptions.sort = config.css.sassdoc.sort;
    }
    return stream.pipe(sassdoc(sassdocOptions));
  }

  
  gulp.task('css', 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps', cssCompile);

  gulp.task('watch:css', function () {
    var tasks = ['css'];
    if (config.css.lint) {
      tasks.push('validate:css');
    }
    return gulp.watch(config.css.src, tasks);
  });

  gulp.task('validate:css', 'Lint Scss files', function () {
    return gulp.src(config.css.src)
        .pipe(cached('validate:css'))
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
  });

  tasks.watch.push('watch:css');
  var cssDeps = [];
  if (config.icons.enabled) {
    cssDeps.push('icons');
    tasks.compile.push('css:full');
  } else {
    tasks.compile.push('css');
  }
  gulp.task('css:full', false, cssDeps, cssCompile);
  if (config.css.lint) {
    tasks.validate.push('validate:css');
  }

};
