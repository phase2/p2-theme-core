'use strict';
var fs = require('fs');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var core = require('./core.js');

module.exports = function (gulp, config, tasks) {
  function plBuild(cb) {
    // Need to check if `public/` exists yet - i.e. is this first run?
    fs.stat(config.patternLab.dir + 'public/styleguide/html/styleguide.html', function (err, stats) {
      if (!stats) {
        // It's a first run; let's make the directory and copy the initial styleguide folder out of core and into public or we'll get errors.
        core.sh('mkdir -p ' + config.patternLab.dir + 'public/styleguide/ && cp -r ' + config.patternLab.dir + 'core/styleguide/ ' + config.patternLab.dir + 'public/styleguide/');
      }
      // sh('php ' + config.patternLab.dir + 'core/builder.php --generate --nocache');
      core.sh('php ' + config.patternLab.dir + 'core/builder.php --generate --nocache');
      if (config.browserSync.enabled) {
        require('browser-sync').get('server').reload();
      }
      cb();
    });

  }

  // if CSS & JS compiling, ensure it's done before we inject PL
  var injectDeps = [];
  if (config.css.enabled) {
    injectDeps.push('css');
  }
  if (config.js.enabled) {
    injectDeps.push('js');
  }
  gulp.task('inject:pl', 'Inject Bower Components into Pattern Lab', injectDeps, function () {
    var target = gulp.src(config.patternLab.dir + 'source/_patterns/00-atoms/00-meta/*.mustache');
    var sources = [];
    if (config.patternLab.injectBower) {
      sources = sources.concat(bowerFiles({
        includeDev: true
      }));
    }
    if (config.patternLab.injectFiles) {
      sources = sources.concat(config.patternLab.injectFiles);
    }
    sources = sources.concat(config.js.dest + '*.js');
    sources = sources.concat(config.css.dest + '*.css');
    return target.pipe(inject(gulp.src(sources), {
      relative: true,
      ignorePath: '../'
    }))
        .pipe(gulp.dest(config.patternLab.dir + 'source/_patterns/00-atoms/00-meta/'));
  });

  gulp.task('watch:inject:pl', function () {
    var files = ['./config.yml'];
    if (config.patternLab.injectBower) {
      files.push('./bower.json');
    }
    gulp.watch(files, ['inject:pl']);
  });
  
  var taskDependencies = ['inject:pl'];
  if (config.icons.enabled) {
    taskDependencies.push('icons');
  }

  gulp.task('pl:full', false, taskDependencies, plBuild);
  gulp.task('pl', 'Compile Pattern Lab', plBuild);

  gulp.task('watch:pl', function () {
    return gulp.watch(config.patternLab.dir + 'source/**/*.{mustache,json}', ['pl']);
  });

  //tasks.validate.push('validate:pl');
  tasks.watch.push('watch:pl');
  tasks.watch.push('watch:inject:pl');
  tasks.compile.push('pl:full');

};