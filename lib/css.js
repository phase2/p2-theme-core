'use strict';
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var stylelint = require('gulp-stylelint');
var postcss = require('gulp-postcss');
var cached = require('gulp-cached');
var autoprefixer = require('autoprefixer');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var sassdoc = require('sassdoc');
var join = require('path').join;
var del = require('del');
//var debug = require('gulp-debug');

// Startup check to avoid multiple dependency runs
var isStartup = require('./startup').isStartup;
var ranOnce = false;

module.exports = function (gulp, config, tasks) {

  function cssCompile(done, errorShouldExit) {
    gulp.src(config.css.src)
    .pipe(sassGlob())
    .pipe(plumber({
      errorHandler: function (error) {
        notify.onError({
          title: 'CSS <%= error.name %> - Line <%= error.line %>',
          message: '<%= error.message %>'
        })(error);
        if (errorShouldExit) process.exit(1);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init({
      debug: config.debug
    }))
    .pipe(sass({
      outputStyle: config.css.outputStyle,
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
    .pipe(gulpif(config.css.flattenDestOutput, flatten()))
    .pipe(gulp.dest(config.css.dest))
    .on('end', function () {
      done();
    });
  }

  cssCompile.description = 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps';

  gulp.task('css', cssCompile);

  gulp.task('clean:css', function cleanCss(done) {
    del([
      join(config.css.dest, '*.{css,css.map}')
    ]).then(function () {
      done();
    });
  });

  function validateCss(errorShouldExit) {
    return gulp.src(config.css.src)
      .pipe(cached('validate:css'))
      .pipe(stylelint({
        failAfterError: errorShouldExit,
        reporters: [
          {formatter: 'string', console: true}
        ]
      }));
  }

  function validateCssWithNoExit() {
    return validateCss(false);
  }

  validateCss.description = 'Lint Scss files';

  gulp.task('validate:css', function () {
    return validateCss(true);
  });

  function docsCss() {
    return gulp.src(config.css.src)
      .pipe(sassdoc({
        dest: config.css.sassdoc.dest,
        verbose: config.css.sassdoc.verbose,
        basePath: config.css.sassdoc.basePath,
        exclude: config.css.sassdoc.exclude,
        theme: config.css.sassdoc.theme,
        sort: config.css.sassdoc.sort
      }));
  }

  docsCss.description = 'Build CSS docs using SassDoc';

  gulp.task('docs:css', docsCss);

  gulp.task('clean:docs:css', function cleanCssDocs(done) {
    del([config.css.sassdoc.dest]).then(function () {
      done();
    });
  });

  function watchCss() {
    var tasks = ['css'];
    if (config.css.lint.enabled) {
      tasks.push(validateCssWithNoExit);
    }
    if (config.css.sassdoc.enabled) {
      tasks.push('docs:css');
    }
    return gulp.watch(config.css.src, gulp.parallel(tasks));
  }

  watchCss.description = 'Watch Scss';

  gulp.task('watch:css', watchCss);

  tasks.watch.push('watch:css');

  var cssDeps = [];
  if (config.icons.enabled) {
    cssDeps.push('icons');
  }

  gulp.task('css:full', gulp.series(cssDeps, function cssFull(done) {
    // This task should only run once on startup, no matter the dependency
    if (isStartup() && ranOnce)  {
      console.info('Task css:full called multiple times on startup as dependency of other tasks. Deferring.');
      done();
      return;
    }
    cssCompile(done, true);
    ranOnce = true;
  }));
  tasks.compile.push('css:full');

  if (config.css.lint.enabled) {
    tasks.validate.push('validate:css');
  }

  if (config.css.sassdoc.enabled) {
    tasks.compile.push('docs:css');
    tasks.clean.push('clean:docs:css');
  }

  tasks.clean.push('clean:css');

};
