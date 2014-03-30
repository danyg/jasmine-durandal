/*global module, require */
module.exports = function( grunt ) {
	'use strict';
	
	function m(a,b){
		var i, c = {};
		for(i in a){
			c[i] = a[i];
		}
		for(i in b){
			if(typeof(b[i]) === 'object'){
				c[i] = m(c[i], b[i]);
			}else{
				c[i] = b[i];
			}
		}
		return c;
	}

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
		buildDir: 'dist',
		rootPath: 'tests/mocks',
		appPath: 'tests/mocks/app',
		testPath: 'tests',
		specsPath: 'tests/specs',
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

			src: R + webappConfig.srcDir,
			specs: R + webappConfig.specsPath
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
	
	var requireConfig_build_13 = m(requireConfig, {paths: {'jasmine-durandal': R +'<%= webapp.buildDir %>/jasmine-durandal-1.3x'}});
//	var requireConfig_build_20 = m(requireConfig, {paths: {'jasmine-durandal': R +'<%= webapp.buildDir %>/jasmine-durandal-2.x.js'}});

	grunt.initConfig({
		webapp: webappConfig,
		
		exec: {
			bower: {
				cmd: 'bower install'
			},
			build_13: {
				cmd: 'node jasmine-durandal-builder.js --basedir /<%= webapp.srcDir %> --main jasmine-durandal-1.3x.js --output /<%= webapp.buildDir %>'
			}
		},

		pkg: grunt.file.readJSON('package.json'),

		clean: {
			build: ['dist/*']
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
			tdd: {
				src: '<%= webapp.appPath %>/**/*.js',
				options: {
					specs: '<%= webapp.testPath %>/specs/dev/**/*spec.js',
					summary: true,
					display: 'full',

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
			build_13: {
				src: '<%= webapp.appPath %>/**/*.js',
				options: {
					specs: '<%= webapp.testPath %>/specs/**/*build_spec_13.js',
					keepRunner: false,
					template: require('grunt-template-jasmine-requirejs-preloader'),
					templateOptions: {
						requireConfig: requireConfig_build_13,
						requireConfigFile: '<%= webapp.appPath %>/main.js',
						preloads: ['jquery', 'jasmine-jquery', 'sinon', 'jasmine-durandal']
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
		
		requirejs: {
			compile: {
				options: {
					baseUrl: '',
					name: '<%= webapp.srcDir %>/jasmine-durandal-1.3x',
					mainConfigFile: 'buildConfig.js',
					out: '<%= webapp.buildDir %>/jasmine-durandal.js'
				}
			}
		},

		watch: {
			build: {
				files: ['<%= webapp.buildDir %>/**/*.js'],
				tasks: ['jshint', 'exec:build_13', 'jasmine:build:build']
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
	
	grunt.loadNpmTasks('grunt-contrib-requirejs');

//Resgistering Tasks
	grunt.registerTask('build', [
		'jshint',
		'clean',
		'exec:build_13',
//		'requirejs:compile'
		'jasmine:build_13'
	]);

	grunt.registerTask('default', [
		'jshint',
		'exec:bower',
		'jasmine:dev',
		'connect:dev:livereload',
		'open:dev',
		'watch:dev'
	]);

	grunt.registerTask('test', [
		'jshint',
		'exec:bower',
		'connect:dev',
		'jasmine:tdd'
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
