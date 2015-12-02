module.exports = function (grunt, config, tasks) {
  "use strict";
  // `config` vars set in `Gruntconfig.yml`

  var jsFiles = [
    config.jsDir + "**/*.js",
    "!" + config.jsDir + "**/node_modules/**/*",
    "!" + config.jsDir + "**/bower_components/**/*"
  ];
  
  var jsHintForce = true;
  if (grunt.option('noTestForce')) {
    jsHintForce = false;
  }

  //var jsHintSrc = jsFiles;
  //jsHintSrc.push("!<%= babel.js.src %>");

  grunt.config.merge({
    watch: {
      js: {
        files: jsFiles,
        tasks: [
          "newer:babel:js",
          "shell:livereload",
          "newer:jshint:js"
        ]
      }
    },
    babel: {// https://github.com/babel/grunt-babel
      options: {
        sourceMap: true
      },
      js: {
        src: config.jsDir + "es6/**/*.{js,jsx}",
        dest: config.jsDir + "compiled-from-es6.js"
      }
    },
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        force: jsHintForce
      },
      js: {
        files: {
          src: jsFiles.concat("!<%= babel.js.src %>") // ignoring jshinting of ES6 for now @todo 
        }
      }
    }
  });

  tasks.compile.push("babel:js");
  tasks.validate.push("jshint:js");
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-babel');
};
