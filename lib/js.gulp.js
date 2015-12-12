'use strict';
module.exports = function (gulp, plugins, config, tasks) {

  gulp.task('eslint', function () {
    return gulp.src(config.js.src)
      .pipe(plugins.cached('js'))
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format());
  });
  
  gulp.task('watch:js', function() {
    return gulp.watch(config.js.src, [
      'eslint'
    ]);
  });

  tasks.watch.push('watch:js');
  tasks.validate.push('eslint');

};
