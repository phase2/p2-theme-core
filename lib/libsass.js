module.exports = function (grunt, config, tasks) {
  "use strict";
  // `config` vars set in `Gruntconfig.yml`
  
  grunt.config.merge({
    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        outputStyle: 'expanded'
      },
      dist: {
        files: [{
          src: config.scssDir + 'style.scss',
          dest: config.scssDest
        }]
      }
    },
    sass_globbing: {
      options: {
        useSingleQuotes: false
      },
      partials: {
        src: config.scssDir + '**/_*.scss',
        dest: config.scssDir + '_all-partials.scss'
      }
    },
    postcss: {
      options: {
        map: {
          prev: false,
          inline: true
        },
        processors: [
          require('autoprefixer-core')({
            browsers: [
              'last 2 versions',
              'IE >= 9'
            ]
          })
        ]
      },
      styles: {
        src: config.scssDest
      }
    },
    sasslint: {
      options: {
        configFile: '.scss-lint.yml'
      },
      styles: [
        config.scssDir + "/**/*.scss",
        "!" + config.scssDir + "**/*tmp*.*"
      ]
    },
    watch: {
      styles: {
        files: [
          config.scssDir + "**/*.scss",
          "!" + config.scssDir + "**/*tmp*.*"
        ],
        tasks: [
          "stylesCompile",
          "shell:livereload",
          "newer:sasslint:styles" // only lint the newly change files
        ]
      }
    }
  });

  grunt.registerTask("stylesCompile", [
    'sass_globbing',
    'sass',
    'postcss:styles'
  ]);

  tasks.compile.push("stylesCompile");
  tasks.validate.push("sasslint:styles");
  
  grunt.loadNpmTasks('grunt-sass-lint');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-sass-globbing');
};
