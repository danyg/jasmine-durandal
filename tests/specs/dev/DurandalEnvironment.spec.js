/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([
	'src/DurandalEnvironment',
	'durandal/app',
	'durandal/viewLocator',
	'durandal/events',
	'viewmodels/welcome',
	'viewmodels/error'
], function(Testee, app, viewLocator, Events, okModule, errorModule){

	'use strict';

	describe('DurandalEnvironment', function(){

		it('Has a Public API', function(){
			expect(typeof Testee).toBe('function');
			expect(typeof Testee.prototype.init).toBe('function');
			expect(typeof Testee.prototype.configurePlugins).toBe('function');
			expect(typeof Testee.prototype.getModule).toBe('function');
			expect(typeof Testee.prototype.$).toBe('function');
			expect(typeof Testee.prototype.destroy).toBe('function');
			
			expect(typeof Testee.prototype.beforeStart).toBe('function');
			expect(typeof Testee.prototype.afterStart).toBe('function');
		});

		describe('Functionality', function(){

			beforeEach(function(){
				sinon.spy(app, 'start');
				sinon.spy(app, 'configurePlugins');
				sinon.spy(app, 'setRoot');
				
				sinon.spy(Testee.prototype, 'destroy');
			});
			afterEach(function(){
				app.start.restore();
				app.configurePlugins.restore();
				app.setRoot.restore();
				Testee.prototype.destroy.restore();
			});

			it('default lifecycle', function(){
				var started = false,
					denv
				;
				runs(function(){
					expect(typeof okModule).toBe('function');
					expect(okModule.prototype.compositionComplete).toBeUndefined();

					denv = new Testee('viewmodels/welcome');
					expect(okModule.prototype.compositionComplete).toBeUndefined();
				});
				
				waits(100);
				
				runs(function(){
					denv.configurePlugins({
						router:true,
						dialog: true,
						widget: true
					});
					viewLocator.useConvention();
					var prom = denv.init();
					
					
					expect(prom).toBeDefined();
					expect(typeof prom.then).toBe('function');

					prom
						.done(function(){
							started = true;
						})
						.fail(function(err){
							throw err;
						})
					;
				});

				waitsFor(function(){
					return started;
				}, 1000);

				runs(function(){
					expect(app.configurePlugins.calledOnce).toBe(true);
					expect(app.start.calledOnce).toBe(true);

					expect(okModule.prototype.compositionComplete).toBeDefined(); // composition complete was spyed by DurandalEnvironment

					expect(app.setRoot.calledOnce).toBe(true);
					expect($('body >.DurandalEnvironment')).toBeInDOM();
					
					expect(denv.$('h2')).toEqual($('body >.DurandalEnvironment [data-view="views/welcome"] >h2'));
					expect(denv.$('h2')).toHaveAttr('data-bind');
					expect(denv.$('h2').attr('data-bind')).toEqual('html:displayName');
					expect(denv.$('h2').html()).toEqual('Welcome to the Durandal Starter Kit!');
				});
				runs(function(){
					
					denv.destroy();
					expect(okModule.prototype.compositionComplete).toBeUndefined();
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
					
				});

			});

			it('error lifecycle', function(){
				var error = false,
					started = false,
					denv
				;
				runs(function(){
					expect(typeof errorModule).toBe('function');
	
					denv = new Testee('viewmodels/error');
					denv.configurePlugins({
						router:true,
						dialog: true,
						widget: true
					});
					viewLocator.useConvention();
					denv.init()
						.done(function(){
							started = true;
						})
						.fail(function(err){
							error = err; // error!
						})
					;
				});
				
				waitsFor(function(){
					return !!error || !!started;
				}, 1000);
				
				runs(function(){
					expect(error).toBeDefined();
					expect(error.indexOf('error.text')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});
			});
		});

	});

});