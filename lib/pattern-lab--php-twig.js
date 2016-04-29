'use strict';
var core = require('./core.js');

module.exports = function (gulp, config, tasks) {

  gulp.task('pl', 'Compile Pattern Lab', function (cb) {
    core.sh('php ' + config.patternLab.src.root + 'core/console --generate');
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