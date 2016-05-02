'use strict';
var core = require('./core.js');
var path = require('path');

module.exports = function (gulp, config, tasks) {

  gulp.task('pl', 'Compile Pattern Lab', function (cb) {
    var consolePath = path.join(config.patternLab.src.root, 'core/console');
    core.sh('php ' + consolePath +  ' --generate');
    if (config.browserSync.enabled) {
      require('browser-sync').get('server').reload();
    }
    cb();
  });

  gulp.task('watch:pl', function () {
    return gulp.watch(config.patternLab.src.source + '**/*.{twig,json,yaml,md}', ['pl']);
  });

  tasks.watch.push('watch:pl');
  tasks.compile.push('pl');

};