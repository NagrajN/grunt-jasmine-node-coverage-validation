module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
      jshint: {
        options: {
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: true,
          newcap: true,
          noarg: true,
          sub: true,
          undef: true,
          boss: true,
          eqnull: true,
          node: true,
          es5: true
        },
        all: ['tasks/**/*.js']
      },
      jasmine_node: {
        options: {
          coverage: {
            options : {
              branches : 100 ,
              functions: 100,
              statements:100,
              lines:100
            }
          },
          junitreport: {
            report: false,
            savePath : "./build/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
          }
        },
        calculator: {
          options: {
            specNameMatcher: 'calculator\\.spec',
          },
          src: [ 'spec/' ],
        },
        objutil: {
          options: {
            specNameMatcher: 'obj-util\\.spec',
          },
          src: [ 'spec/' ],
        },
        all: [ 'spec/' ],
        nosrc: {}
      }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadTasks('tasks');

    //grunt.registerTask('default', ['jshint' ,'jasmine_node']);
	
   grunt.registerTask('default', ['jasmine_node']);


};
