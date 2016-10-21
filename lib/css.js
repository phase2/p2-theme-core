'use strict';
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const stylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const cached = require('gulp-cached');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const flatten = require('gulp-flatten');
const gulpif = require('gulp-if');
const sassdoc = require('sassdoc');
const join = require('path').join;
const del = require('del');
// const debug = require('gulp-debug');

module.exports = (gulp, config, tasks) => {
  function cssCompile(done, errorShouldExit) {
    gulp.src(config.css.src)
    .pipe(sassGlob())
    .pipe(plumber({
      errorHandler(error) {
        notify.onError({
          title: 'CSS <%= error.name %> - Line <%= error.line %>',
          message: '<%= error.message %>',
        })(error);
        if (errorShouldExit) process.exit(1);
        this.emit('end');
      },
    }))
    .pipe(sourcemaps.init({
      debug: config.debug,
    }))
    .pipe(sass({
      outputStyle: config.css.outputStyle,
      sourceComments: config.css.sourceComments,
      includePaths: config.css.includePaths,
    }).on('error', sass.logError))
    .pipe(postcss(
      [
        autoprefixer({
          browsers: config.css.autoPrefixerBrowsers,
        }),
      ]
    ))
    .pipe(sourcemaps.write((config.css.sourceMapEmbed) ? null : './'))
    .pipe(gulpif(config.css.flattenDestOutput, flatten()))
    .pipe(gulp.dest(config.css.dest))
    .on('end', () => {
      done();
    });
  }

  cssCompile.description = 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps';

  gulp.task('css', done => cssCompile(done, true));

  gulp.task('clean:css', (done) => {
    del([
      join(config.css.dest, '*.{css,css.map}'),
    ], { force: true }).then(() => {
      done();
    });
  });

  function validateCss(errorShouldExit) {
    return gulp.src(config.css.src)
      .pipe(cached('validate:css'))
      .pipe(stylelint({
        failAfterError: errorShouldExit,
        reporters: [
          { formatter: 'string', console: true },
        ],
      }));
  }

  function validateCssWithNoExit() {
    return validateCss(false);
  }

  validateCss.description = 'Lint Scss files';

  gulp.task('validate:css', () => validateCss(true));

  function docsCss() {
    return gulp.src(config.css.src)
      .pipe(sassdoc({
        dest: config.css.sassdoc.dest,
        verbose: config.css.sassdoc.verbose,
        basePath: config.css.sassdoc.basePath,
        exclude: config.css.sassdoc.exclude,
        theme: config.css.sassdoc.theme,
        sort: config.css.sassdoc.sort,
      }));
  }

  docsCss.description = 'Build CSS docs using SassDoc';

  gulp.task('docs:css', docsCss);

  gulp.task('clean:docs:css', (done) => {
    del([config.css.sassdoc.dest]).then(() => {
      done();
    });
  });

  function watchCss() {
    const watchTasks = [cssCompile];
    if (config.css.lint.enabled) {
      watchTasks.push(validateCssWithNoExit);
    }
    if (config.css.sassdoc.enabled) {
      watchTasks.push('docs:css');
    }
    const src = config.css.extraWatches
      ? [].concat(config.css.src, config.css.extraWatches)
      : config.css.src;
    return gulp.watch(src, gulp.parallel(watchTasks));
  }

  watchCss.description = 'Watch Scss';

  gulp.task('watch:css', watchCss);

  tasks.watch.push('watch:css');

  tasks.compile.push('css');

  if (config.css.lint.enabled) {
    tasks.validate.push('validate:css');
  }

  if (config.css.sassdoc.enabled) {
    tasks.compile.push('docs:css');
    tasks.clean.push('clean:docs:css');
  }

  tasks.clean.push('clean:css');
};
