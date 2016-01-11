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
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var sassdoc = require('sassdoc');
var del = require('del');
//var debug = require('gulp-debug');

module.exports = function (gulp, config, tasks) {

  function cssCompile(done) {
    gulp.src(config.css.src)
    .pipe(sassGlob())
    .pipe(plumber({
      errorHandler: function (error) {
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
  
  gulp.task('css', 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps', cssCompile);
  
  gulp.task('clean:css', 'Clean CSS files', function(done) {
    del([
      config.css.dest + '*.{css,css.map}'
    ]).then(function () {
      done();
    });
  });

  gulp.task('validate:css', 'Lint Scss files', function () {
    var src = config.css.src;
    if (config.css.lint.extraSrc) {
      src = src.concat(config.css.lint.extraSrc);
    }
    return gulp.src(src)
    .pipe(cached('validate:css'))
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(gulpif(config.css.lint.failOnError, sassLint.failOnError()));
  });
  
  gulp.task('sassdoc', 'Build sass docs', function () {
    return gulp.src(config.css.src)
    .pipe(sassdoc({
      dest: config.css.sassdoc.dest,
      verbose: config.css.sassdoc.verbose,
      basePath: config.css.sassdoc.basePath,
      exclude: config.css.sassdoc.exclude,
      theme: config.css.sassdoc.theme,
      sort: config.css.sassdoc.sort
    }));
  });

  gulp.task('watch:css', function () {
    var tasks = ['css'];
    if (config.css.lint) {
      tasks.push('validate:css');
    }
    if (config.css.sassdoc.enabled) {
      tasks.push('sassdoc');
    }
    return gulp.watch(config.css.src, tasks);
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

  if (config.css.lint.enabled) {
    tasks.validate.push('validate:css');
  }

  if (config.css.sassdoc.enabled) {
    tasks.compile.push('sassdoc');
  }
  
  if (tasks.clean) {
    tasks.clean.push('clean:css');
  }

};
