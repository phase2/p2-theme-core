module.exports = {
  css: {
    enabled: true,
    src: [
      'scss/**/*.scss',
    ],
    dest: 'dest/',
    extraWatches: [],
    flattenDestOutput: true,
    lint: {
      enabled: true,
      failOnError: true,
      // in addition to linting `css.src`, this is added.
      extraSrc: [],
    },
    // enables additional debugging information in the output file as CSS comments - only use when necessary
    sourceComments: false,
    sourceMapEmbed: false,
    // tell the compiler whether you want 'expanded' or 'compressed' output code
    outputStyle: 'expanded',
    // https://github.com/ai/browserslist#queries
    autoPrefixerBrowsers: [
      'last 2 versions',
      'IE >= 10',
    ],
    includePaths: [
      './node_modules',
    ],
    // http://sassdoc.com
    sassdoc: {
      enabled: false,
      dest: 'dest/sassdoc',
      verbose: false,
      basePath: '',
      exclude: [],
      theme: 'default',
      // http://sassdoc.com/customising-the-view/#sort
      sort: [
        'file',
        'group',
        'line>',
      ],
    },
  },
  js: {
    enabled: true,
    src: [
      'js/**/*.js',
    ],
    dest: 'dest/',
    destName: 'all.min.js',
    sourceMapEmbed: false,
    uglify: false,
    babel: false,
    // Will bundle all bower JS dependencies (not devDeps) and create a `bower_components.min.js` file in `js.dest`.
    bundleBower: true,
    bundleBowerExclusions: [],
    bowerBasePath: './',
    eslint: {
      enabled: true,
      src: [
        'js/**/*.js',
        'gulpfile.js',
      ],
    },
  },
  patternLab: {
    enabled: false,
    configFile: 'pattern-lab/config/config.yml',
    watchedExtensions: [
      'twig',
      'json',
      'yaml',
      'yml',
      'md',
      'jpg',
      'jpeg',
      'png',
    ],
    extraWatches: [],
  },
  // https://github.com/nfroidure/gulp-iconfont
  icons: {
    enabled: false,
    src: 'images/icons/src/*.svg',
    dest: 'dest/',
    fontPathPrefix: '',
    classNamePrefix: 'icon',
    autohint: false,
    normalize: true,
    useTimestamp: false,
    templates: {
      enabled: true,
      css: {
        src: 'images/icons/templates/_icons.scss',
        dest: 'scss/00-config/',
      },
      demo: {
        src: 'images/icons/templates/icons.twig',
        dest: 'pattern-lab/source/_patterns/00-atoms/images/',
      },
    },
    formats: [
      'ttf',
      'eot',
      'woff',
      'svg',
    ],
  },
  browserSync: {
    enabled: false,
    port: 3050,
    watchFiles: [],
    // enable when full CMS is set up
    // domain: 'mysite.dev',
    baseDir: './',
    startPath: 'pattern-lab/public/',
    openBrowserAtStart: false,
    // requires above to be true; allows non-default browser to open
    browser: [
      'Google Chrome',
    ],
    // Tunnel the Browsersync server through a random Public URL
    // -> http://randomstring23232.localtunnel.me
    tunnel: false,
    reloadDelay: 50,
    reloadDebounce: 750,
  },
  drupal: {
    enabled: false,
    // when these files change
    watch: [
      'template.php',
      'templates/**',
    ],
    // run this command
    command: 'drush cc all',
    // in this directory
    dir: './',
  },
};
