'use strict';
var gulp = require('gulp-help')(require('gulp'));
var config = {
  css: {
    src: 'src/**/*.scss',
    dest: 'dest'
  }
};
var tasks = {
  'compile': [],
  'watch': [],
  'validate': [],
  'clean': [],
  'default': []
};

require('../../index.js')(gulp, config, tasks);

gulp.task('compile', tasks.compile);
gulp.task('validate', tasks.validate);
gulp.task('watch', tasks.watch);
tasks.default.push('compile');
tasks.default.push('watch');
gulp.task('default', tasks.default);
