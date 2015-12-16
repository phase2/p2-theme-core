'use strict';
var gulp = require('gulp');
var yaml = require('js-yaml');
var fs = require('fs');
var config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
var tasks = {
  'compile': [],
  'watch': [],
  'validate': [],
  'default': []
};

if (config.browserSync.enabled) {
  require('../lib/browser-sync.js')(gulp, config, tasks);
}

if (config.js.enabled) {
  require('../lib/js.js')(gulp, config, tasks);
}

if (config.css.enabled) {
  require('../lib/css.js')(gulp, config, tasks);
}

if (config.icons.enabled) {
  require('../lib/icons.js')(gulp, config, tasks);
}

if (config.patternLab.enabled) {
  require('../lib/pattern-lab.js')(gulp, config, tasks);
}

gulp.task('compile', tasks.compile);
gulp.task('validate', tasks.validate);
gulp.task('watch', tasks.watch);
tasks.default.push('compile');
tasks.default.push('watch');
gulp.task('default', tasks.default);
