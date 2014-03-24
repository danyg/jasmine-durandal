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
				viewLocator.useConvention();
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
					error = false,
					denv
				;
				runs(function(){
					denv = new Testee('viewmodels/welcome');
					denv.configurePlugins({
						router:true,
						dialog: true,
						widget: true
					});
					
					var prom = denv.init();


					expect(prom).toBeDefined();
					expect(typeof prom.then).toBe('function');

					prom
						.done(function(){
							started = true;
						})
						.fail(function(err){
							error = 'ERROR: ' + err;
						})
					;
				});

				waitsFor(function(){
					return !!started || !!error;
				}, 1000, 'waiting for started');

				runs(function(){
					expect(error).toBe(false);
					expect(app.configurePlugins.calledOnce).toBe(true);
					expect(app.start.calledOnce).toBe(true);
					expect(app.setRoot.calledOnce).toBe(true);

					expect($('body >.DurandalEnvironment')).toBeInDOM();
					
					expect(denv.getModule() instanceof okModule).toBe(true);

					expect(denv.$('h2')).toEqual($('body >.DurandalEnvironment [data-view="views/welcome"] >h2'));
					expect(denv.$('h2')).toHaveAttr('data-bind');
					expect(denv.$('h2').attr('data-bind')).toEqual('html:displayName');
					expect(denv.$('h2').html()).toEqual('Welcome to the Durandal Starter Kit!');
				});
				runs(function(){

					denv.destroy();
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();

				});

			});
			
			it('beforeStart & afterStart are triggered properly', function(){
				var beforeStart = false,
					afterStart = false,
					started = false,
					error = false,
					denv
				;
				
				runs(function(){
					denv = new Testee('viewmodels/welcome');
					denv.beforeStart(function(){
						beforeStart = Date.now();
					});
					denv.afterStart(function(){
						afterStart = Date.now();
					});
					
					denv.init()
						.done(function(){
							started = Date.now();
						})
						.fail(function(err){
							error = 'ERROR: ' + err;
						})
					;
					expect(beforeStart).toBeTruthy();
				});
				
				waitsFor(function(){
					return !!started || !!error;
				}, 1000, 'waiting for started on beforestart');
				
				runs(function(){
					expect(error).toBe(false);

					expect(afterStart).toBeTruthy();
					expect(afterStart).toBeLessThan(started);
					denv.destroy();
				});
			});

			it('error on the view', function(){
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
				}, 1000, 'waiting for error');

				runs(function(){
					expect(error).toBeDefined();
					expect(error.indexOf('error.text')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});
			});
			
			it('error missing view', function(){
				var error = false,
					started = false,
					denv
				;
				runs(function(){
					expect(typeof errorModule).toBe('function');

					denv = new Testee('viewmodels/missingView');
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
					expect(error.indexOf('missingView')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.DurandalEnvironment')).not.toBeInDOM();
				});
			});
			
			describe('should init several times', function(){
				var error = false,
					started = false,
					denv = new Testee('viewmodels/welcome')
				;
				
				it('default behavior', function(){
					runs(function(){
						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '1st Time');

					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);

						error = false;
						started = false;
						denv.destroy();

						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '2nd Time');
					
					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);
						denv.destroy();
					});
				});
				
				it('error behavior', function(){
					runs(function(){
						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '3th Time');

					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);

						error = false;
						started = false;
						denv.trigger('ERROR', 'A fake error');

						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '4th Time');
					
					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);
						denv.destroy();
					});
				});

				it('even more times', function(){
					
					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);

						error = false;
						started = false;
						denv.destroy();

						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '5th Time');

					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);

						error = false;
						started = false;
						denv.destroy();

						denv.init()
							.done(function(){
								started = true;
							})
							.fail(function(err){
								error = 'ERROR: ' + err;
							})
						;
					});

					waitsFor(function(){
						return !!started || !!error;
					}, 1000, '6th Time');

					runs(function(){
						expect(started).toBe(true);
						expect(error).toBe(false);

						error = false;
						started = false;
						denv.destroy();
					});
				});
			});
		});

	});

});