'use strict';
const core = require('./core');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const inject = require('gulp-inject');
const _ = require('lodash');
const browserSync = require('browser-sync');
const glob = require('glob');

module.exports = (gulp, config, tasks) => {
  let plConfig = yaml.safeLoad(
    fs.readFileSync(config.patternLab.configFile, 'utf8')
  );
  const plRoot = path.join(config.patternLab.configFile, '../..');
  const plSource = path.join(plRoot, plConfig.sourceDir);
  const plPublic = path.join(plRoot, plConfig.publicDir);
  const plMeta = path.join(plSource, '/_meta');
  const consolePath = path.join(plRoot, 'core/console');
  const watchTriggeredTasks = [];

  function plBuild(done, errorShouldExit) {
    core.sh(`php ${consolePath} --generate`, errorShouldExit, (err) => {
      if (config.browserSync.enabled) {
        browserSync.get('server').reload();
      }
      done(err);
    });
  }

  gulp.task('pl', done => plBuild(done, true));

  // Begin `<link>` & `<script>` injecting code.
  // Will look for these HTML comments in `plSource/_meta/*.twig:
  // `<!-- inject:css -->`
  // `<!-- endinject -->`
  // `<!-- inject:js -->`
  // `<!-- endinject -->`

  function injectPl(done) {
    let sources = [];
    if (config.patternLab.injectFiles) {
      sources = sources.concat(config.patternLab.injectFiles);
    }
    sources = sources.concat(glob.sync(path.normalize(`${config.js.dest}/*.js`)));
    sources = sources.concat(glob.sync(path.normalize(`${config.css.dest}/*.css`)));

    // We need to make sure our JS deps like jQuery are loaded before ours (`config.js.destName`)
    const rearrangedSources = [];
    sources.forEach((source) => {
      if (path.basename(source) === config.js.destName) {
        // add to end
        rearrangedSources.push(source);
      } else {
        // add to beginning
        rearrangedSources.unshift(source);
      }
    });

    gulp
      .src(['*.twig'], { cwd: plMeta })
      .pipe(inject(gulp.src(rearrangedSources, { read: false }), {
        relative: false,
        addRootSlash: false,
        addSuffix: '?cacheBuster={{ cacheBuster }}',
        addPrefix: path.join('../..', path.relative(plPublic, process.cwd())),
      }))
      .pipe(gulp.dest(plMeta))
      .on('end', done);
  }

  gulp.task('inject:pl', injectPl);

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

  function getTwigNamespaceConfig(workingDir) {
    workingDir = workingDir || process.cwd(); // eslint-disable-line no-param-reassign
    const twigNamespaceConfig = {};
    config.patternLab.twigNamespaces.sets.forEach((namespaceSet) => {
      const pathArray = namespaceSet.paths.map((pathBase) => {
        const results = glob.sync(path.join(pathBase, '**/*.twig')).map((pathItem) => { // eslint-disable-line arrow-body-style
          return path.relative(workingDir, path.dirname(pathItem));
        });
        results.unshift(path.relative(workingDir, pathBase));
        return results;
      });
      twigNamespaceConfig[namespaceSet.namespace] = {
        paths: core.uniqueArray(core.flattenArray(pathArray)),
      };
    });
    return twigNamespaceConfig;
  }

  function addTwigNamespaceConfigToDrupal(done) {
    const twigNamespaceConfig = getTwigNamespaceConfig(path.dirname(config.drupal.themeFile));
    const drupalThemeFile = yaml.safeLoad(
      fs.readFileSync(config.drupal.themeFile, 'utf8')
    );
    Object.assign(drupalThemeFile['component-libraries'], twigNamespaceConfig);
    const newThemeFile = yaml.safeDump(drupalThemeFile);
    fs.writeFileSync(config.drupal.themeFile, newThemeFile, 'utf8');
    done();
  }

  function addTwigNamespaceConfigToPl(done) {
    const twigNamespaceConfig = getTwigNamespaceConfig(plRoot);
    plConfig = yaml.safeLoad(
      fs.readFileSync(config.patternLab.configFile, 'utf8')
    );
    if (!plConfig.plugins) {
      Object.assign(plConfig, {
        plugins: {
          twigNamespaces: { enabled: true, namespaces: {} },
        },
      });
    } else if (!plConfig.plugins.twigNamespaces) {
      Object.assign(plConfig.plugins, {
        twigNamespaces: { enabled: true, namespaces: {} },
      });
    } else if (!plConfig.plugins.twigNamespaces.namespaces) {
      plConfig.plugins.twigNamespaces.namespaces = {};
    }
    Object.assign(plConfig.plugins.twigNamespaces.namespaces, twigNamespaceConfig);
    const newConfigFile = yaml.safeDump(plConfig);
    fs.writeFileSync(config.patternLab.configFile, newConfigFile, 'utf8');
    done();
  }

  if (config.patternLab.twigNamespaces) {
    gulp.task('twigNamespaces', (done) => {
      addTwigNamespaceConfigToPl(() => {
        if (config.patternLab.twigNamespaces.addToDrupalThemeFile) {
          addTwigNamespaceConfigToDrupal(done);
        }
        done();
      });
    });
    plFullDependencies.push('twigNamespaces');
    watchTriggeredTasks.push('twigNamespaces');
  }

  gulp.task('pl:full', gulp.series(plFullDependencies, plBuild));

  const watchedExtensions = config.patternLab.watchedExtensions.join(',');
  gulp.task('watch:pl', () => {
    const plGlob = [path.normalize(`${plSource}/**/*.{${watchedExtensions}}`)];
    const src = config.patternLab.extraWatches
      ? [].concat(plGlob, config.patternLab.extraWatches)
      : plGlob;
    // plBuild goes last after any deps
    watchTriggeredTasks.push(plBuild);
    gulp.watch(src, gulp.series(watchTriggeredTasks));
  });

  tasks.watch.push('watch:pl');
  tasks.compile.push('pl:full');
};
