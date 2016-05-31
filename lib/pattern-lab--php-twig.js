'use strict';
var core = require('./core.js');
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');

module.exports = function (gulp, config, tasks) {
  var plConfig = yaml.safeLoad(
    fs.readFileSync(config.patternLab.configFile, 'utf8')
  );
  var plRoot = path.join(config.patternLab.configFile, '../..');
  var plSource = path.join(plRoot, plConfig.sourceDir);
  var plPublic = path.join(plRoot, plConfig.publicDir);
  var consolePath = path.join(plRoot, 'core/console');
  
  function plBuild(cb) {
    core.sh('php ' + consolePath +  ' --generate');
    if (config.browserSync.enabled) {
      require('browser-sync').get('server').reload();
    }
    cb();
  }
  
  gulp.task('pl', 'Compile Pattern Lab', plBuild);
  
  var watchedExtensions = config.patternLab.watchedExtensions.join(',');
  gulp.task('watch:pl', function () {
    var plGlob = path.normalize(plSource + '/**/*.{' + watchedExtensions + '}' );
    return gulp.watch(plGlob, ['pl']);
  });
  
  // Begin `<link>` & `<script>` injecting code.
  // Will look for these HTML comments in `plSource/_meta/*.twig:
  // `<!-- inject:css -->`
  // `<!-- endinject -->`
  // `<!-- inject:js -->`
  // `<!-- endinject -->`
  // if CSS & JS compiling, ensure it's done before we inject PL
  var injectDeps = [];
  if (config.css.enabled) {
    injectDeps.push('css:full');
  }
  if (config.js.enabled) {
    injectDeps.push('js');
  }
  gulp.task('inject:pl', 'Inject Bower Components into Pattern Lab', injectDeps, function (done) {
    var sources = [];
    if (config.patternLab.injectBower) {
      sources = sources.concat(bowerFiles({
        includeDev: true
      }));
    }
    if (config.patternLab.injectFiles) {
      sources = sources.concat(config.patternLab.injectFiles);
    }
    sources = sources.concat(path.normalize(config.js.dest + '/*.js'));
    sources = sources.concat(path.normalize(config.css.dest + '/*.css'));
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

    var pathToPlDest = path.relative(plPublic, process.cwd());

    gulp.src([
      path.join(plSource, '/_meta/*.twig')
    ], {base: pathToPlDest})
    .pipe(inject(gulp.src(sources, {read: false}), {
      relative: true,
      ignorePath: '../',
      addPrefix: pathToPlDest
    }))
    .pipe(gulp.dest(pathToPlDest))
    .on('end', function() {
      done();
    });
    
  });
  
  if (config.patternLab.injectBower) {
    gulp.task('watch:inject:pl', function () {
      gulp.watch('./bower.json', ['inject:pl']);
    });
    tasks.watch.push('watch:inject:pl');
  }// end `if (config.patternLab.injectBower)`
    
  var plFullDependencies = ['inject:pl'];
  if (config.icons.enabled) {
    plFullDependencies.push('icons');
  }
  
  if (config.patternLab.scssToJson) {
    // turns scss files full of variables into json files that PL can iterate on
    gulp.task('pl:scss-to-json', function (done) {
      config.patternLab.scssToJson.forEach(function(pair) {
        var scssVarList = fs.readFileSync(pair.src, 'utf8').split('\n').filter(function(item) {
          return item.startsWith(pair.lineStartsWith);
        });
        // console.log(scssVarList, item.src);
        var varsAndValues = scssVarList.map(function(item) {
          var x = item.split(':');
          return {
            name: x[0].trim(), // i.e. $color-gray
            value: x[1].replace(';', '').trim() // i.e. hsl(0, 0%, 50%)
          };
        });
        
        if (! pair.allowVarValues) {
          varsAndValues = varsAndValues.filter(function(item) {
            return ! item.value.startsWith('$');
          });
        }
        
        fs.writeFileSync(pair.dest, JSON.stringify({
          items: varsAndValues,
          meta: {
            description: 'To add to these items, use Sass variables that start with <code>' + pair.lineStartsWith + '</code> in <code>' + pair.src + '</code>' 
          }
        }, null, '  '));
        
      });
      done();
    });
    plFullDependencies.push('pl:scss-to-json');
    
    gulp.task('watch:pl:scss-to-json', function() {
      var files = config.patternLab.scssToJson.map(function(file) {return file.src;});
      gulp.watch(files, ['pl:scss-to-json']);
    });
    tasks.watch.push('watch:pl:scss-to-json');
  }
  
  gulp.task('pl:full', false, plFullDependencies, plBuild);
  
  
  tasks.watch.push('watch:pl');
  tasks.compile.push('pl:full');

};