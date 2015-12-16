module.exports = function (grunt, config, tasks) {
  'use strict';
  // `config` vars set in `Gruntconfig.yml`

  var jsFiles = [
    config.jsDir + '**/*.js',
    '!' + config.jsDir + '**/node_modules/**/*',
    '!' + config.jsDir + '**/bower_components/**/*'
  ];
  
  var jsHintForce = true;
  if (grunt.option('noTestForce')) {
    jsHintForce = false;
  }

  grunt.config.merge({
    watch: {
      js: {
        files: jsFiles,
        tasks: [
          'shell:livereload',
          'newer:jshint:js'
        ]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: jsHintForce
      },
      js: {
        files: {
          src: jsFiles 
        }
      }
    }
  });

  tasks.validate.push('jshint:js');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-jshint');
};
