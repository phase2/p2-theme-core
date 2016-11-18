'use strict';
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const cached = require('gulp-cached');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync');
const bowerFiles = require('main-bower-files');
const path = require('path');

module.exports = (gulp, config, tasks) => {
  function validateJs() {
    return gulp.src(config.js.eslint.src)
      .pipe(cached('validate:js'))
      .pipe(eslint())
      .pipe(eslint.format());
  }

  validateJs.description = 'Lint JS.';

  gulp.task('validate:js', () => validateJs().pipe(eslint.failAfterError()));

  function compileJs(done) {
    gulp.src(config.js.src)
      .pipe(sourcemaps.init())
      .pipe(gulpif(config.js.babel, babel())) // all babel options handled in `.babelrc`
      .pipe(concat(config.js.destName))
      .pipe(gulpif(config.js.uglify, uglify()))
      .pipe(sourcemaps.write((config.js.sourceMapEmbed) ? null : './'))
      .pipe(gulp.dest(config.js.dest))
      .on('end', () => {
        if (config.browserSync.enabled) {
          browserSync.get('server').reload();
        }
        done();
      });
  }

  compileJs.description = 'Transpile JS using Babel, concat and uglify.';

  gulp.task('js', compileJs);

  gulp.task('watch:js', () => gulp.watch(config.js.src, gulp.parallel('js', validateJs)));

  gulp.task('clean:js', (done) => {
    del([
      `${config.js.dest}*.{js,js.map}`,
    ], { force: true }).then(() => {
      done();
    });
  });

  /**
   * Bundle up Bower JS Dependencies.
   * Creates `bower--{devDeps,deps}.min.js` in `config.js.dest`.
   * @param devDeps {boolean} If true, just devDeps, else just deps.
   * @param done {function}
   */
  function bundleBower(done, devDeps) {
    const exclusions = config.js.bundleBowerExclusions;
    const files = bowerFiles({
      paths: config.patternLab.bowerBasePath || './',
      filter: (filePath) => {
        let isExcluded = false;
        if (exclusions && exclusions.length) {
          const directories = filePath.split('/');
          // see if any directory name matches anything in the excluded list
          isExcluded = directories.some(dir => exclusions.some(item => item === dir));
        }
        return path.extname(filePath) === '.js' && !(isExcluded);
      },
      includeDev: devDeps ? 'exclusive' : false, // `'exclusive'` does just devDeps w/o deps
    });
    if (files.length) {
      gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat(`bower--${devDeps ? 'devDeps' : 'deps'}.min.js`))
        .pipe(uglify())
        .pipe(sourcemaps.write((config.js.sourceMapEmbed) ? null : './'))
        .pipe(gulp.dest(config.js.dest))
        .on('end', () => {
          process.stdout.write(`Bower ${devDeps ? 'devDeps' : 'deps'} bundled: ${files.map(file => path.basename(file)).join(', ')}.\n`);
          done();
        });
    } else {
      done();
    }
  }

  if (config.js.bundleBower) {
    gulp.task('js:bundleBower', gulp.parallel(
      function bundleBowerDeps(done) { bundleBower(done); },
      function bundleBowerDevDeps(done) { bundleBower(done, true); }
    ));

    // @todo remove `config.patternLab.bowerBasePath` in v10.0.0
    const bowerBasePath = config.js.bowerBasePath || config.patternLab.bowerBasePath || './';
    gulp.task('watch:bower', () => {
      gulp.watch(path.join(bowerBasePath, 'bower.json'), gulp.series('js:bundleBower'));
    });
    tasks.compile.push('js:bundleBower');
    tasks.watch.push('watch:bower');
  }

  tasks.clean.push('clean:js');
  tasks.compile.push('js');
  tasks.watch.push('watch:js');
  tasks.validate.push('validate:js');
};
