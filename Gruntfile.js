module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        connect: {
            server: {
                options: {
                    port: 9001
                }
            }
        },
        jasmine: {
            frontend_specs: {
                options: {
                    outfile: "public/specs/_SpecRunner.html",
                    specs: "public/specs/**/*spec.js",
                    host: "http://127.0.0.1:9001/",
                    template: require("grunt-template-jasmine-requirejs"),
                    templateOptions: {
                        requireConfigFile: "public/specs/require_conf_test.js"
                    }
                }
            }
        },
        watch: {
            scripts: {
                files: ['public/specs/**/*.js','public/src/**/*.js'],
                tasks: ['test_frontend'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-jasmine-nodejs");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("test_frontend", ["jasmine"]);

    // common test task
    grunt.registerTask("default", ["connect", "test_frontend","watch"]);
    grunt.registerTask("test", ["connect", "test_frontend"]);

};
