var startup = false;

module.exports = {
  gulpTask: function (gulp, config, tasks) {
    gulp.task('startup:start', function startupStart(cb) {
      startup = true;
      cb();
    });
    gulp.task('startup:stop', function startupStop(cb) {
      startup = false;
      cb();
    });
  },
  isStartup: function() {
    return startup;
  }
};
