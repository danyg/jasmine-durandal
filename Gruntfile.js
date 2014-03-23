/*global module, require */
module.exports = function( grunt ) {
	'use strict';

	// Livereload and connect variables
	var LIVERELOAD_PORT = 35729;

	var lrSnippet = require('connect-livereload')({
		port: LIVERELOAD_PORT
	});
	var mountFolder = function( connect, dir ) {
		return connect.static(require('path').resolve(dir));
	};

	// configurable paths
	var webappConfig = {
		srcPath: 'src',
		srcDir: 'src',
		rootPath: 'tests/mocks',
		appPath: 'tests/mocks/app',
		testPath: 'tests',
		libDir: 'libs',
		relToApp: '../../../'
	};

	var R = webappConfig.relToApp;

	var requireConfig = {
		baseUrl: webappConfig.appPath,
		paths: {
			// Durandal Config
			text: R+'libs/requirejs-text/text',
			durandal:R+'libs/durandal/js',
			plugins: R+'libs/durandal/js/plugins',
			transitions: R+'libs/durandal/js/transitions',
			knockout: R+'libs/knockout.js/knockout',
			bootstrap: R+'libs/bootstrap/bootstrap/dist/js/bootstrap.min',
			jquery: R+'libs/jquery/jquery.min',
			// END Durandal Config

			'jasmine-jquery': R+'libs/jasmine-jquery/lib/jasmine-jquery',
			'sinon': R+'tests/lib/sinon/sinon-1.7.3',

			src: R + webappConfig.srcDir
		},
		shim: {
			'bootstrap': {
				deps: ['jquery'],
				exports: 'jQuery'
			},
			'jasmine-jquery': {
				deps: ['jquery'],
				exports: 'jQuery'
			}
		}
	};

	grunt.initConfig({
		webapp: webappConfig,
		
		exec: {
			bower: {
				cmd: 'bower install'
			}
		},

		pkg: grunt.file.readJSON('package.json'),

		clean: {
			build: ['build/*']
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: ['Gruntfile.js', '<%= webapp.testPath %>/specs/dev/**/*spec.js', '<%= webapp.srcPath %>/**/*.js'],
		},

		connect: {
			build: {
				options: {
					port: 9001,
					hostname: 'localhost',
					base: 'build'
				}
			},
			dev: {
				options: {
					port: 8999,
					hostname: 'localhost',
					middleware: function( connect ) {
						return [lrSnippet, mountFolder(connect, '.')];
					}
				}
			}
		},

		jasmine: {
			dev: {
				src: '<%= webapp.appPath %>/**/*.js',
				options: {
					specs: '<%= webapp.testPath %>/specs/dev/**/*spec.js',

					keepRunner: false,
					template: require('grunt-template-jasmine-requirejs-preloader'),

					templateOptions: {
						requireConfig: requireConfig,
						requireConfigFile: '<%= webapp.appPath %>/main.js',
						preloads: ['jquery', 'jasmine-jquery', 'sinon', 'src/DurandalEnvironment']
					},
					host: 'http://localhost:<%= connect.dev.options.port %>/',
					version: '1.3.1'
				}
			},
			tdd: {
				src: '<%= webapp.appPath %>/**/*.js',
				options: {
					specs: '<%= webapp.testPath %>/specs/dev/**/*spec.js',

					keepRunner: true,
					template: require('grunt-template-jasmine-requirejs-preloader'),

					templateOptions: {
						requireConfig: requireConfig,
						requireConfigFile: '<%= webapp.appPath %>/main.js',
						preloads: ['jquery', 'jasmine-jquery', 'sinon', 'src/DurandalEnvironment']
					},
					host: 'http://localhost:<%= connect.dev.options.port %>/',
					version: '1.3.1'
				}
			},
			build: {
				options: {
					specs: 'test/specs/build/**/*spec.js',
					keepRunner: true,
					template: require('grunt-template-jasmine-requirejs-preloader'),
					templateOptions: {
						requireConfig: requireConfig,
						requireConfigFile: '<%= webapp.appPath %>/main.js',
						preloads: ['jquery', 'jasmine-jquery', 'sinon']
					},
					version: '1.3.1'
				}
			}
		},

		open: {
			dev: {
				path: 'http://localhost:<%= connect.dev.options.port %>/'
			},
			tdd: {
				path: 'http://localhost:<%= connect.dev.options.port %>/_SpecRunner.html'
			},

			notest: {
				path: 'http://localhost:<%= connect.dev.options.port %>/'
			},

			build: {
				path: 'http://localhost:<%= connect.build.options.port %>'
			}
		},


//		uglify: {
//			options: {
//				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
//					'* Copyright (c) <%= grunt.template.today("yyyy") %> YourName/YourCompany \n' +
//					'* Available via the MIT license.\n' +
//					'* see: http://opensource.org/licenses/MIT for blueprint.\n' +
//					'*/\n'
//			},
//			build: {
//				src: 'build/app/main.js',
//				dest: 'build/app/main-built.js'
//			}
//		},

		watch: {
			build: {
				files: ['build/**/*.js'],
				tasks: ['jasmine:build']
			},
			tdd: {
				files: ['<%= webapp.testPath %>/specs/dev/**/*spec.js', '<%= webapp.srcPath %>/**/*.js', '<%= webapp.appPath %>/**/*.js'],
				tasks: ['jshint', 'jasmine:tdd:build'],
				options: {
					livereload: true
				}
			}
		}
	});

// Loading plugin(s)
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-exec');

//Resgistering Tasks
	grunt.registerTask('build', ['jshint', 'jasmine:dev', 'clean', 'copy', 'durandal:main', 'uglify', 'jasmine:build', 'connect:build', 'open:build', 'watch:build']);

	grunt.registerTask('default', [
		'jshint',
		'exec:bower',
		'jasmine:dev',
		'connect:dev:livereload',
		'open:dev',
		'watch:dev'
	]);

	grunt.registerTask('tdd', [
		'jshint',
		'exec:bower',
		'connect:dev:livereload',
		'jasmine:tdd:build',
		'open:tdd',
		'watch:tdd'
	]);

	grunt.registerTask('notest', ['jshint', 'connect:dev:livereload', 'open:notest', 'watch:dev']);


};
