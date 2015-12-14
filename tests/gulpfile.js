'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'gulp.*',
    'autoprefixer'
  ]
});
// Will result in the following happening:
//    
//    plugins.jshint = require('gulp-jshint');
//    plugins.concat = require('gulp-concat');
plugins.browserSync = require('browser-sync');
var yaml = require('js-yaml');
var fs = require('fs');
var config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
var tasks = {
  'compile': [],
  'watch': [],
  'validate': [],
  'default': []
};

if (config.js.enabled) {
  require('../lib/js.gulp.js')(gulp, plugins, config, tasks);
}

if (config.css.enabled) {
  require('../lib/css.gulp.js')(gulp, plugins, config, tasks);
}

if (config.icons.enabled) {
  require('../lib/icons.gulp.js')(gulp, plugins, config, tasks);
}

if (config.patternLab.enabled) {
  require('../lib/pattern-lab.gulp.js')(gulp, plugins, config, tasks);
}

gulp.task('compile', tasks.compile);
gulp.task('validate', tasks.validate);
gulp.task('watch', tasks.watch);

gulp.task('default', [
  'compile',
  'watch'
]);
