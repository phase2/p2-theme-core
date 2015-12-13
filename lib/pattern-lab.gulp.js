'use strict';
var exec = require('child_process').execSync;
var fs = require('fs');

function sh(cmd) {
  console.log(exec(cmd, {encoding: 'utf8'}));
}

module.exports = function (gulp, plugins, config, tasks) {

  function plBuild() {
    sh("php " + config.patternLab.dir + "core/builder.php --generate --nocache");
  }

  gulp.task('plBuild', function (cb) {
    // Need to check if `public/` exists yet - i.e. is this first run?
    fs.stat(config.patternLab.dir + "public/styleguide/html/styleguide.html", function (err, stats) {
      if (stats) {
        plBuild();
        cb();
      } else {
        // It's a first run; let's make the directory and copy the initial styleguide folder out of core and into public or we'll get errors.
        sh("mkdir -p " + config.patternLab.dir + "public/styleguide/ && cp -r " + config.patternLab.dir + "core/styleguide/ " + config.patternLab.dir + "public/styleguide/");
        plBuild();
        cb();
      }
    });

  });

  gulp.task('watch:pl', ['plBuild'], function () {
    return gulp.watch(config.patternLab.dir + 'source/**/*.{mustache,json}', [
      'plBuild'
    ]);
  });

//gulp.task('serve:pl', ['plBuild'], function () {
//  return browserSync.init({
//    server: {
//      baseDir: './',
//      directory: true
//    },
//    startPath: config.patternLab.dir + 'public/index.html',
//    open: openBrowserAtStart,
//    browser: 'Google Chrome'
//  });
//});

  //tasks.validate.push('validate:pl');
  tasks.watch.push('watch:pl');
  tasks.compile.push('plBuild');
  //tasks.default.push('serve:pl');

};
