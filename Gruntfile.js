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
        name: 'amqptools',
        project: 'src/',
        out: './lib/amqptools.d.ts',
        moduleResolution: 'commonjs',
        target: "es5",
        indent: "  ",
        files: ['src/index.ts'],
        main: 'amqptools/index'
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

  grunt.registerTask('default', ['clean', 'copy', 'ts', 'dtsGenerator']);

};