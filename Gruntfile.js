'use strict';

var paths = {
    serverSpec: ['server/tests/serverSpec.js'],
    js: ['server/modules/*.js', 'public/modules/*.js']
};

module.exports = function(grunt) {

    console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV !== 'production') {
        require('time-grunt')(grunt);
    }

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            options: {
                reporter: 'spec',
                require: [
                    'app.js'
                ]
            },
            src: paths.serverSpec
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Test task.
    grunt.registerTask('test', ['mochaTest', 'karma:unit']);

    //js linting
    //grunt.registerTask('lint', ['jshint']);

};
