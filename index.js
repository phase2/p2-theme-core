module.exports = function (grunt, config, tasks) {
  "use strict";
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
