'use strict';
var exec = require('child_process').execSync;
var inject = require('gulp-inject');
var path = require('path');
var bowerFiles = require('main-bower-files');
var _ = require('lodash');

function sh(cmd) {
  console.log(exec(cmd, {
    encoding: 'utf8'
  }));
}
module.exports = function(gulp, config, tasks) {

  gulp.task('watch:drupal', function() {
    gulp.watch(config.drupal.watch, function() {
      sh('cd ' + config.drupal.dir + ' && ' + config.drupal.command);
      require('browser-sync').get('server').reload();
    });
  });

  function injectDrupal(done) {
    if (_.endsWith(config.drupal.inject.file, '.info')) {
      // Drupal 7
      var target = gulp.src(config.drupal.inject.file);
      var sources = [];
      if (config.drupal.inject.bower) {
        sources = sources.concat(bowerFiles({
          includeDev: false
        }));
      }
      if (config.drupal.inject.ignoreFiles) {
        sources = _.filter(sources, function(item) {
          var myRegexp = new RegExp(config.drupal.inject.ignoreFiles);
          if (item.search(myRegexp) === -1) {
            return true;
          }
        });
      }
      sources = sources.concat(path.normalize(config.js.dest + '/*.js'));
      sources = sources.concat(path.normalize(config.css.dest + '/*.css'));
      return target.pipe(inject(gulp.src(sources), {
        relative: true,
        ignorePath: '../',
        starttag: '; inject:{{ext}}',
        endtag: '; endinject',
        transform: function(filepath) {
          if (_.endsWith(filepath, 'js')) {
            return 'scripts[] = ' + filepath;
          }
          if (_.endsWith(filepath, 'css')) {
            return 'stylesheets[all][] = ' + filepath;
          }
        }
      }))
        .pipe(gulp.dest('./'));
    } else if (_.endsWith(config.drupal.inject.file, '.info.yml')) {
      console.log('Drupal 8 support not ready yet for injecting into ' + config.drupal.inject.file);
      done();
    } else {
      console.log('Not a theme file we understand for injecting dependencies into: ' + config.drupal.inject.file);
      console.log('Check config.yml under drupal.inject.file');
      done();
    }
  }

  // if CSS & JS compiling, ensure it's done before we inject Drupal
  var injectDeps = [];
  if (config.css.enabled) {
    injectDeps.push('css:full');
  }
  if (config.js.enabled) {
    injectDeps.push('js');
  }
  gulp.task('inject:drupal', gulp.series(injectDeps, injectDrupal));

  gulp.task('watch:inject:drupal', function() {
    var files = ['./config.yml'];
    if (config.patternLab.injectBower) {
      files.push('./bower.json');
    }
    return gulp.watch(files, injectDrupal);
  });

  tasks.compile.push('inject:drupal');
  tasks.watch.push('watch:inject:drupal');
  tasks.watch.push('watch:drupal');

};
