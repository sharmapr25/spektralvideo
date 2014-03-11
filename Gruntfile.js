module.exports = function(grunt) {

    // configure the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            build: {
                cwd: "source",
                src: ["**"],
                dest: "build",
                expand: true
            }
        },
        clean: {
            build: {
                src: ["build"]
            },
            scripts: {
                src: ["build/*.js", "!build/spektralvideo.beta-min.js"]
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: true
                },
                files: {
                    "build/spektralvideo.beta-min.js": ["build/spektralvideo.beta.js"]
                }
            }
        },
        watch: {
            build: {
                files: ["js/**"],
                tasks: ["build"]
            },
            specs: {
                files: ["spec/**"],
                tasks: ["jasmine"]
            }
        },
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: "build",
                    hostname: "*"
                }
            }
        },
        jasmine: {
            pivotal: {
                src: "build/spektralvideo.beta-min.js",
                options: {
                    specs: "spec/spektralvideospec.js",
                    outfile: "SpecRunner.html",
                    keepRunner: true
                }
            }
        }
    });

    //Copies files from source folder to build folder - command: grunt copy
    grunt.loadNpmTasks("grunt-contrib-copy");

    //Wipes the build folder clean of files - command: grunt clean
    grunt.loadNpmTasks("grunt-contrib-clean");

    //Minifies files - command: grunt uglify
    grunt.loadNpmTasks("grunt-contrib-uglify");

    //Watch files for changes - command: grunt watch
    grunt.loadNpmTasks("grunt-contrib-watch");

    //Development server - command: grunt connect
    grunt.loadNpmTasks("grunt-contrib-connect");

    //Unit testing framework
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    //Jasmine
    grunt.registerTask(
        "test",
        "Tests NodeMaker.",
        ["jasmine"]
    );

    //Scripts
    grunt.registerTask(
        "scripts",
        "Compiles the Javascript files.",
        ["uglify", "clean:scripts"]
    );

    //Build
    grunt.registerTask(
        "build",
        "Compiles all of the assets and copies the files to the build directory.",
        ["clean:build", "copy", "scripts", "jasmine"]
    );

    //Default - command: grunt default
    grunt.registerTask(
        "default",
        "Watches the project for changes, automatically builds them and runs a server.",
        ["build", "connect", "watch"]
    );
};