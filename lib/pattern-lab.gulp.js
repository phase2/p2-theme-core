'use strict';
var gulp = require('gulp');
var exec = require('child_process').execSync;
var fs = require('fs');
var gulpif = require('gulp-if');

function sh(cmd) {
  console.log(exec(cmd, {encoding: 'utf8'}));
}

module.exports = function (gulp, config, tasks) {
  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function(x) {return x;};
  }

  function plBuild() {
    sh("php " + config.patternLab.dir + "core/builder.php --generate --nocache");
    reload();
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

  //tasks.validate.push('validate:pl');
  tasks.watch.push('watch:pl');
  tasks.compile.push('plBuild');

};
