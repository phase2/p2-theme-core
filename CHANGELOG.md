## v9.2.0

- Added ability to bundle all bower dependency JS files, uglify them, add sourcemaps and output to `config.js.dest` folder as `bower_components.min.js`. This is togglable by `config.js.bundleBower` and is set to `true` by default.

### v9.2.2

- Bower bundle renamed from `bower_components.min.js` to `bower--deps.min.js` - this only includes deps
- `bundleBower` now outputs devDeps too as: `bower--devDeps.min.js` - this only includes devDeps

# v9.3.0

Adding new `patternLab.twigNamespaces` functionality for more resilient and flexible include paths. Can now just do `@molecules/filename.twig` instead of `@molecules/path/to/filename.twig`. Injects config into Drupal theme file and Pattern Lab config file; requires both the Drupal Component Libraries module and the Pattern Lab Twig Namespaces plugin.
 
Example config:

```js
patternLab: {
  twigNamespaces: {
    addToDrupalThemeFile: true,
    sets: ['base', 'atoms', 'molecules', 'organisms', 'templates', 'pages'].map((item, i) => ({
      namespace: item,
      paths: [`source/_patterns/0${i}-${item}`],
    }))
  }
},
drupal: {
  themeFile: 'patternlab.info.yml'
}
```
