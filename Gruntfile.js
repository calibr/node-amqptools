'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt, {
    ts: 'grunt-ts',
    clean: 'grunt-contrib-clean',
    copy: 'grunt-contrib-copy',
    dtsGenerator: 'dts-generator'
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
    dtsGenerator: {
      options: {
        baseDir: '.',
        name: 'ampqtools',
        project: 'src/',
        out: 'lib/ampqtools.d.ts',
        indent: "  ",
        files: ['src/index.ts']
      },
      default: {
        src: [ 'src/**/*.ts', 'typings/**/*.ts' ]
      }
    },
    copy: {
      build: {
        files: [
          {expand: true, cwd: 'src/', src: ['**/*', '!**/*.ts', '!**/*.json'], dest: 'lib/'}
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

  grunt.task.registerTask("test", function(testName) {
    var done = this.async();
    grunt.util.spawn({
      cmd: "mocha",
      args: ["test/" + testName, "--bail", "--timeout", 5000],
      opts: {
        cwd: __dirname + "/lib",
        stdio: "inherit"
      }
    }, function(text, res) {
      done(res.code);
    });
  });

  grunt.registerTask('default', ['clean', 'copy', 'ts', 'dtsGenerator']);

};