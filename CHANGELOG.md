## v9.2.0

- Added ability to bundle all bower dependency JS files, uglify them, add sourcemaps and output to `config.js.dest` folder as `bower_components.min.js`. This is togglable by `config.js.bundleBower` and is set to `true` by default.

### v9.2.2

- Bower bundle renamed from `bower_components.min.js` to `bower--deps.min.js` - this only includes deps
- `bundleBower` now outputs devDeps too as: `bower--devDeps.min.js` - this only includes devDeps
