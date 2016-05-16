'use strict';
var core = require('./core.js');
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');


module.exports = function (gulp, config, tasks) {
  var plConfig = yaml.safeLoad(
    fs.readFileSync(config.patternLab.configFile, 'utf8')
  );
  var plRoot = path.join(config.patternLab.configFile, '../..');
  var plSource = path.join(plRoot, plConfig.sourceDir);
  
  gulp.task('pl', 'Compile Pattern Lab', function (cb) {
    var consolePath = path.join(plRoot, 'core/console');
    core.sh('php ' + consolePath +  ' --generate');
    if (config.browserSync.enabled) {
      require('browser-sync').get('server').reload();
    }
    cb();
  });

  gulp.task('watch:pl', function () {
    var plGlob = path.normalize(plSource + '/**');
    return gulp.watch(plGlob, ['pl']);
  });

  tasks.watch.push('watch:pl');
  tasks.compile.push('pl');

};