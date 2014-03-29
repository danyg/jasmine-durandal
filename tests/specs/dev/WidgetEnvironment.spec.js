/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([
	'src/WidgetEnvironment',
	'src/DurandalEnvironment',
	'durandal/app',
	'durandal/viewLocator',
	'durandal/events',
	'widgets/good/viewmodel'
], function(Testee, DurandalEnvironment, app, viewLocator, Events, OkWidget){
	'use strict';

	describe('WidgetEnvironment', function(){

		it('Has a Public API', function(){
			
			// proper API
			expect(typeof Testee.prototype.newInstance).toBe('function');
			expect(typeof Testee.prototype.getCurrentInstance).toBe('function');
			expect(typeof Testee.prototype.destroyWidget).toBe('function');
			
			// Durandal Environment API
			expect(typeof Testee.prototype.init).toBe('function');
			expect(typeof Testee.prototype.$).toBe('function');
			expect(typeof Testee.prototype.destroy).toBe('function');

		});

		describe('Functionality', function(){

			beforeEach(function(){
				sinon.spy(Testee.prototype, 'destroy');
			});
			afterEach(function(){
				Testee.prototype.destroy.restore();
			});

			it('should throws if newInstance is called without settings', function(){
				var inst = new Testee('good');
				function testee(){
					inst.newInstance();
				}
				
				expect(testee).toThrow();
				inst.destroy();
			});

			it('default lifecycle', function(){
				var started = false,
					error = false,
					denv,
					widget
				;
				runs(function(){
					expect(typeof OkWidget).toBe('function');

					denv = new Testee('good');
					
					sinon.spy(denv._denv, 'init');
					
					var prom = denv.newInstance({
						color: 'green',
						title: 'ola'
					});

					expect(prom).toBeDefined();
					expect(typeof prom.then).toBe('function');

					prom
						.done(function(){
							started = true;
						})
						.fail(function(err){
							error = err;
						})
					;
				});

				waitsFor(function(){
					return !!started || !!error;
				}, 1000);

				runs(function(){
					expect(error).toBe(false);
					expect(denv._denv.init.called).toBe(true);

					expect($('body >.DurandalEnvironment')).toBeInDOM();
					widget = denv.getCurrentInstance();
					expect(widget).toBeDefined();
					expect(widget instanceof OkWidget).toBe(true);

					expect(denv.$('[data-testid="title"]')).toBeInDOM();
					expect(denv.$('[data-testid="color"]')).toBeInDOM();
				});
				
				runs(function(){
					denv.destroy();
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});

			});
			
			it('default lifecycle using init', function(){
				var started = false,
					error = false,
					denv,
					widget
				;
				runs(function(){
					expect(typeof OkWidget).toBe('function');
					denv = new Testee('good');

					sinon.spy(denv._denv, 'init');

					denv.init()
						.done(function(){
							started = true;
						})
						.fail(function(err){
							error = err;
						})
					;
				});
				
				waitsFor(function(){
					return !!started || !!error;
				}, 1000);
				
				runs(function(){
					expect(error).toBe(false);

					started = false;
					error = false;
					
					expect(denv._denv.init.callCount).toBe(1);
					expect(denv._denv.isInit()).toBe(true);

					var prom = denv.newInstance({
						color: 'green',
						title: 'ola'
					});

					expect(prom).toBeDefined();
					expect(typeof prom.then).toBe('function');

					prom
						.done(function(){
							started = true;
						})
						.fail(function(err){
							error = err;
						})
					;
				});

				waitsFor(function(){
					return !!started || !!error;
				}, 1000);

				runs(function(){
					expect(error).toBe(false);
					
					expect(denv._denv.init.callCount).toBe(1);

					expect($('body >.DurandalEnvironment')).toBeInDOM();
					widget = denv.getCurrentInstance();
					expect(widget).toBeDefined();
					expect(widget instanceof OkWidget).toBe(true);

					expect(denv.$('[data-testid="title"]')).toBeInDOM();
					expect(denv.$('[data-testid="color"]')).toBeInDOM();
				});
				
				runs(function(){
					denv.destroy();
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});

			});

			xit('error lifecycle', function(){
				var error = false,
					started = false,
					denv
				;
				runs(function(){
					denv = new Testee('error');

					denv.newInstance({
						color: 'red',
						title: 'red'
					})
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
					expect(error).not.toBe(false);
					expect(error.message.indexOf('some error')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});
			});

			it('missingview lifecycle', function(){
				var error = false,
					started = false,
					denv
				;
				runs(function(){
					denv = new Testee('missingview');

					denv.newInstance({
						color: 'red',
						title: 'red'
					})
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
					expect(error).not.toBe(false);
					expect(error.toString().indexOf('View Not Found')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});
			});
		});

	});

});