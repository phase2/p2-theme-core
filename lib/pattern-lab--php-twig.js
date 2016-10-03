const core = require('./core');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const inject = require('gulp-inject');
const bowerFiles = require('main-bower-files');
const _ = require('lodash');
const browserSync = require('browser-sync');

module.exports = (gulp, config, tasks) => {
  const plConfig = yaml.safeLoad(
    fs.readFileSync(config.patternLab.configFile, 'utf8')
  );
  const plRoot = path.join(config.patternLab.configFile, '../..');
  const plSource = path.join(plRoot, plConfig.sourceDir);
  // const plPublic = path.join(plRoot, plConfig.publicDir); // currently unused
  const plMeta = path.join(plSource, '/_meta');
  const consolePath = path.join(plRoot, 'core/console');

  function plBuild(cb) {
    core.sh(`php ${consolePath} --generate`, true, () => {
      if (config.browserSync.enabled) {
        browserSync.get('server').reload();
      }
      cb();
    });
  }

  gulp.task('pl', plBuild);

  const watchedExtensions = config.patternLab.watchedExtensions.join(',');
  gulp.task('watch:pl', () => {
    const plGlob = path.normalize(`${plSource}/**/*.{${watchedExtensions}}`);
    gulp.watch(plGlob, (done) => {
      // const path = path.relative(process.cwd(), event.path);
      // console.log(`File ${path} was ${event.type}, running tasks...`);
      core.sh(`php ${consolePath} --generate`, false, () => {
        if (config.browserSync.enabled) {
          browserSync.get('server').reload();
        }
        done();
      });
    });
  });

  // Begin `<link>` & `<script>` injecting code.
  // Will look for these HTML comments in `plSource/_meta/*.twig:
  // `<!-- inject:css -->`
  // `<!-- endinject -->`
  // `<!-- inject:js -->`
  // `<!-- endinject -->`

  function injectPl(done) {
    let sources = [];
    if (config.patternLab.injectBower) {
      sources = sources.concat(bowerFiles({
        paths: config.patternLab.bowerBasePath || './',
        includeDev: true,
      }));
    }
    if (config.patternLab.injectFiles) {
      sources = sources.concat(config.patternLab.injectFiles);
    }
    sources = sources.concat(path.normalize(`${config.js.dest}/*.js`));
    sources = sources.concat(path.normalize(`${config.css.dest}/*.css`));

    gulp
      .src(['*.twig'], { cwd: plMeta })
      .pipe(inject(gulp.src(sources, { read: false }), {
        relative: true,
        addSuffix: '?cacheBuster={{ cacheBuster }}',
        // ignorePath: path.relative(plMeta, process.cwd()),
        // joining `../..` onto path change I'd have to do to go from plPublic directory to CWD
        // addPrefix: path.join('../..', path.relative(plPublic, process.cwd()))
        addPrefix: '../..',
      }))
      .pipe(gulp.dest(plMeta))
      .on('end', () => {
        done();
      });
  }

  gulp.task('inject:pl', injectPl);

  if (config.patternLab.injectBower) {
    gulp.task('watch:inject:pl', () => {
      gulp.watch(path.join(config.patternLab.bowerBasePath, './bower.json'), injectPl);
    });
    tasks.watch.push('watch:inject:pl');
  }// end `if (config.patternLab.injectBower)`

  const plFullDependencies = ['inject:pl'];

  // turns scss files full of variables into json files that PL can iterate on
  function scssToJson(done) {
    config.patternLab.scssToJson.forEach((pair) => {
      const scssVarList = _.filter(fs.readFileSync(pair.src, 'utf8').split('\n'), item => _.startsWith(item, pair.lineStartsWith));
      // console.log(scssVarList, item.src);
      let varsAndValues = _.map(scssVarList, (item) => {
        // assuming `item` is `$color-gray: hsl(0, 0%, 50%); // main gray color`
        const x = item.split(':');
        const y = x[1].split(';');
        return {
          name: x[0].trim(), // i.e. $color-gray
          value: y[0].replace(/!.*/, '').trim(), // i.e. hsl(0, 0%, 50%) after removing `!default`
          comment: y[1].replace('//', '').trim(), // any inline comment coming after, i.e. `// main gray color`
        };
      });

      if (!pair.allowVarValues) {
        varsAndValues = _.filter(varsAndValues, item => !_.startsWith(item.value, '$'));
      }

      fs.writeFileSync(pair.dest, JSON.stringify({
        items: varsAndValues,
        meta: {
          description: `To add to these items, use Sass variables that start with <code>${pair.lineStartsWith}</code> in <code>${pair.src}</code>`,
        },
      }, null, '  '));
    });
    done();
  }

  if (config.patternLab.scssToJson) {
    gulp.task('pl:scss-to-json', scssToJson);
    plFullDependencies.push('pl:scss-to-json');

    gulp.task('watch:pl:scss-to-json', () => {
      const files = config.patternLab.scssToJson.map(file => file.src);
      gulp.watch(files, scssToJson);
    });
    tasks.watch.push('watch:pl:scss-to-json');
  }

  gulp.task('pl:full', gulp.series(plFullDependencies, plBuild));

  tasks.watch.push('watch:pl');
  tasks.compile.push('pl:full');
};
