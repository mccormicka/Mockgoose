'use strict';

module.exports = function (grunt) {

    //Default task runs tests, jshint and watches for changes.
    grunt.registerTask('default',
        ['mochaTest', 'jshint', 'watch']);

    //Just run tests
    grunt.registerTask('test', 'mochaTest');

    //Alias for default
    grunt.registerTask('test:watch', 'default');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //Tests
        mochaTest: {
            test: {
                options: {
                },
                src: ['test/**/*.js']
            }
        },

        //Clean code.
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: { src: ['Mockgoose.js', 'lib/**/*.js', 'test/**/*.js']}
        },

        //Files to watch and actions to take when they are changed.
        watch: {
            files: ['Mockgoose.js', 'lib/**/*.js', 'test/**/*.spec.js'],
            tasks: ['jshint', 'mochaTest']
        }
    });

    // Load the plugins
    // Watch the file system for changes.
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Runs tests.
    grunt.loadNpmTasks('grunt-mocha-test');
    // Clean code validator.
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
