/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
(function(){
	'use strict';
	nwgui.App.setCrashDumpDir(nwgui.App.dataPath);
	
	// clean exceptions from a previous load (refresh case)
	if(process._events.uncaughtException.length > 0){
		process._events.uncaughtException.splice(0,1);
	}
	process.on('uncaughtException', function(e){
		console.group('Node uncaughtException');
		if(!!e.message){
			console.log(e.message);
		}
		if(!!e.stack){
			console.log(e.stack);
		}
		console.log(e);
		console.groupEnd();
	});
	// Clean Buggy thing
	if(process._events.uncaughtException.length > 1 
		&& !!process._events.uncaughtException[0].toString().match(/native code/)
	){
		process._events.uncaughtException.splice(0,1);
	}
	
	var R = '../../../';
	var info_tests = requireNode('./tests/info_tests'),
		require_config = {
			baseUrl: info_tests.path.app + '/app',
			paths: {
				// Durandal Config
				text: R+'libs/requirejs-text/text',
		        durandal:R+'libs/durandal/js',
		        plugins: R+'libs/durandal/js/plugins',
		        transitions: R+'libs/durandal/js/transitions',
		        knockout: R+'libs/knockout.js/knockout-3.0.0.debug',
		        bootstrap: R+'libs/bootstrap/bootstrap',
		        jquery: R+'libs/jquery/jquery-1.10.2',
				// END Durandal Config

		        'jasmine-jquery': R+'tests/lib/jasmine-jquery/jasmine-jquery',
		        'sinon': R+'tests/lib/sinon/sinon-1.7.3',
				specs: info_tests.path.specs,
				src: R+'src/'
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
		}
	;

	define('require_config', require_config);

	var req = require.config(require_config);

	define('nwgui', window.nwgui);

	req(['jquery', 'jasmine-jquery', 'sinon'], function(){
		req(['src/DurandalEnvironment'], function(){
			// Load all sources in order to be getched from the code coverage analyzer
			
			req(info_tests.sources, function(){
				//When we have the sources loaded, we load the specs then run the jasmine
				info_tests.refreshSpecs();
	
				req(info_tests.specs, function(){
					jasmine.getEnv().addReporter(new jasmine.HtmlReporter());
					jasmine.getEnv().execute();
				});
			});
		});
	});

window.req = req;

}());