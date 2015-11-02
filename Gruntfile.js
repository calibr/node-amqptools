'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt, {
    ts: 'grunt-ts',
    clean: 'grunt-contrib-clean',
    copy: 'grunt-contrib-copy'
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      options: {
        module: "commonjs",
        target: "es5",
        failOnTypeErrors: false,
        fast: 'never',
        inlineSourceMap: true
      },
      default: {
        src: ["src/**/*.ts"],
        outDir: "lib"
      }
    },
    copy: {
      build: {
        files: [
          {expand: true, cwd: 'src/', src: ['**/*', '!**/*.ts'], dest: 'lib/'},
        ]
      }
    },
    clean: {
      build: {
        files: [
          {
            dot: true,
            src: [
              'lib/**/*'
            ]
          }
        ]
      }
    }
  });

  grunt.registerTask('default', ['clean', 'copy', 'ts']);

};