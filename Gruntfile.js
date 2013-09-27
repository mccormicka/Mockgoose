module.exports = function (grunt) {
    'use strict';

    //Default task runs tests, jshint and watches for changes.
    grunt.registerTask('default',
        ['jasmine_node', 'jshint', 'watch']);

    //Just run tests
    grunt.registerTask('test', 'jasmine_node');

    //Alias for default
    grunt.registerTask('test:watch', 'default');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //Tests
        jasmine_node: {
            options: {
                forceExit: true,
                verbose: true
            },
            files: { src: 'test/**/*.spec.js'}
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
            tasks: ['jshint', 'jasmine_node']
        }
    });

    // Load the plugins
    // Watch the file system for changes.
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Runs tests.
    grunt.loadNpmTasks('grunt-jasmine-node');
    // Clean code validator.
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
