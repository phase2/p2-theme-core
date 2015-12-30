'use strict';
var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');

module.exports = function (gulp, config, tasks) {
  var plnDir = path.dirname(require.resolve('patternlab-node/package.json')) + '/'; // convention of paths ending in `/`

  function plBuild(cb) {
    var originCwd = process.cwd();
    process.chdir(plnDir);
    require('patternlab-node/builder/patternlab.js')().build(true);
    process.chdir(originCwd);
    if (config.browserSync.enabled) {
      require('browser-sync').get('server').reload();
    }
    cb();
  }

  // sets up pattern lab - the `patternlab-node` module is meant to be used in it's directory; however with some symlinking of our source into it and symlinking of it's public directory out, we can use it as a dependency. This sets it up after a clean install of `patternlab-node`.
  gulp.task('setup:pl', 'Setup Pattern Lab directories using Symlinks - only needed after "npm install"', function (cb) {
    // has this already ran?
    fs.access(plnDir + 'source--orig', function (err) {
      if (err) {
        // backup `source/` folder first to `source--orig/`
        fs.copySync(plnDir + 'source', plnDir + 'source--orig');
      }
      // setup `source/` dir
      fs.emptyDirSync(plnDir + 'source/');
      // data
      fs.ensureSymlinkSync(config.patternLab.src.data, plnDir + 'source/_data');
      // pl template files
      fs.ensureSymlinkSync(config.patternLab.src.patternLabFiles, plnDir + 'source/_patternlab-files');
      // patterns
      fs.ensureSymlinkSync(config.patternLab.src.patterns, plnDir + 'source/_patterns');

      // css added so media hunter can find and list media queries in menu
      glob.sync(config.css.dest + '*.css').forEach(function (file) {
        fs.ensureSymlinkSync(file, plnDir + 'source/css/' + path.basename(file));
      });
      // done with `source/`
    });
    // setup `public/` dir
    // annotations
    fs.ensureSymlinkSync(config.patternLab.src.data + 'annotations.js', plnDir + 'public/data/annotations.js');
    // linking `public/` folder to more convenient location
    fs.ensureSymlinkSync(plnDir + 'public/', path.resolve(config.patternLab.dest));
    // done with `public/`

    // pl config file
    if (config.patternLab.config) {
      fs.removeSync(plnDir + 'config.json');
      fs.ensureSymlinkSync('./config--pattern-lab.json', plnDir + 'config.json');
    }
    cb();
  });

  // if CSS & JS compiling, ensure it's done before we inject PL
  var injectDeps = [];
  if (config.css.enabled) {
    injectDeps.push('css');
  }
  if (config.js.enabled) {
    injectDeps.push('js');
  }
  gulp.task('inject:pl', 'Inject Bower Components into Pattern Lab', injectDeps, function (cb) {
    var sources = [];
    if (config.patternLab.injectBower) {
      sources = sources.concat(bowerFiles({
        includeDev: true
      }));
    }
    if (config.patternLab.injectFiles) {
      sources = sources.concat(config.patternLab.injectFiles);
    }
    sources = sources.concat(config.js.dest + '*.js');
    sources = sources.concat(config.css.dest + '*.css');
    
    // if we have jQuery installed via Bower, we need to make sure it comes first
    var jQueryPath;
    sources = sources.filter(function(item) {
      var file = item.split('/').pop();
      if (file !== 'jquery.js') {
        return true;
      } else {
        // here's jQuery, pulling it out of array for a sec
        jQueryPath = item;
        return false;
      }
    });
    if (jQueryPath) {
      // adds jQuery to first slot in array of sources
      sources.unshift(jQueryPath);
    }

    var pathToPlDest = path.relative(config.patternLab.dest, process.cwd());
    gulp.src([
      config.patternLab.src.patternLabFiles + 'styleguide.mustache'
    ], {base: config.patternLab.src.patternLabFiles})
        .pipe(inject(gulp.src(sources), {
          relative: true,
          addPrefix: pathToPlDest
        }))
        .pipe(gulp.dest(config.patternLab.src.patternLabFiles));

    gulp.src([
      config.patternLab.src.patternLabFiles + 'pattern-header-footer/*.html'
    ])
    .pipe(inject(gulp.src(sources), {
      relative: true,
      ignorePath: '../',
      addPrefix: pathToPlDest
    }))
    .pipe(gulp.dest(config.patternLab.src.patternLabFiles + 'pattern-header-footer/'));

    cb();
  });

  gulp.task('watch:inject:pl', function () {
    var files = ['./config.yml'];
    if (config.patternLab.injectBower) {
      files.push('./bower.json');
    }
    gulp.watch(files, ['inject:pl']);
  });

  var plFullDependencies = ['inject:pl', 'setup:pl'];
  if (config.icons.enabled) {
    plFullDependencies.push('icons');
  }

  gulp.task('pl:full', false, plFullDependencies, plBuild);
  gulp.task('pl', 'Compile Pattern Lab', plBuild);

  gulp.task('watch:pl', function () {
    return gulp.watch([
      config.patternLab.src.patterns + '**/*.{mustache,json}',
      config.patternLab.src.data + '*.{js,json}'
    ], ['pl']);
  });

  tasks.watch.push('watch:pl');
  tasks.watch.push('watch:inject:pl');
  tasks.compile.push('pl:full');

};
