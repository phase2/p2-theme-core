module.exports = function (grunt, config, tasks) {
  "use strict";
  // Wrap Grunt's loadNpmTasks() function to allow loading Grunt task modules
  // that are dependencies of Grunt Drupal Tasks.
  // Hat tip: Joe Turgeon via https://github.com/phase2/grunt-drupal-tasks/blob/master/bootstrap.js#L12
  grunt._loadNpmTasks = grunt.loadNpmTasks;
  grunt.loadNpmTasks = function (mod) {
    var internalMod = grunt.file.exists(__dirname, 'node_modules', mod);
    if (internalMod) {
      var pathOrig = process.cwd();
      process.chdir(__dirname);
    }
    grunt._loadNpmTasks(mod);
    if (internalMod) {
      process.chdir(pathOrig);
    }
  };

  if (config.features.icons) {
    require('./lib/icons.js')(grunt, config, tasks);
  }
  require('./lib/js.js')(grunt, config, tasks);
  if (config.features.scss) {
    require('./lib/libsass.js')(grunt, config, tasks);
  }
  if (config.features.patternLab) {
    require('./lib/pattern-lab.js')(grunt, config, tasks);
  }
  require('./lib/regression-qa.js')(grunt, config, tasks);
};
