'use strict';
var exec = require('child_process').execSync;
var fs = require('fs');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');

function sh(cmd) {
  console.log(exec(cmd, {
    encoding: 'utf8'
  }));
}

module.exports = function(gulp, config, tasks) {
  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function(x) {
      return x;
    };
  }

  function plBuild() {
    sh('php ' + config.patternLab.dir + 'core/builder.php --generate --nocache');
    reload();
  }

  gulp.task('pl', 'Compile Pattern Lab', ['inject:pl'], function(cb) {
    // Need to check if `public/` exists yet - i.e. is this first run?
    fs.stat(config.patternLab.dir + 'public/styleguide/html/styleguide.html', function(err, stats) {
      if (stats) {
        plBuild();
        cb();
      } else {
        // It's a first run; let's make the directory and copy the initial styleguide folder out of core and into public or we'll get errors.
        sh('mkdir -p ' + config.patternLab.dir + 'public/styleguide/ && cp -r ' + config.patternLab.dir + 'core/styleguide/ ' + config.patternLab.dir + 'public/styleguide/');
        plBuild();
        cb();
      }
    });

  });

  gulp.task('watch:pl', ['pl'], function() {
    return gulp.watch(config.patternLab.dir + 'source/**/*.{mustache,json}', [
      'pl'
    ]);
  });

  gulp.task('inject:pl', 'Inject Bower Components into Pattern Lab', function() {
    var target = gulp.src(config.patternLab.dir + 'source/_patterns/00-atoms/00-meta/*.mustache');
    var sources = [config.css.dest + '*.css'];
    if (config.patternLab.injectBower) {
      sources = sources.concat(bowerFiles({
        includeDev: true
      }));
    }
    sources = sources.concat(config.patternLab.injectFiles);
    return target.pipe(inject(gulp.src(sources), {
      relative: true,
      ignorePath: '../'
    }))
      .pipe(gulp.dest(config.patternLab.dir + 'source/_patterns/00-atoms/00-meta/'));
  });

  gulp.task('watch:inject:pl', function() {
    var files = ['./config.yml'];
    if (config.patternLab.injectBower) {
      files.push('./bower.json');
    }
    return gulp.watch(files, ['inject:pl']);
  });

  //tasks.validate.push('validate:pl');
  tasks.watch.push('watch:pl');
  tasks.watch.push('watch:inject:pl');
  tasks.compile.push('pl');

};