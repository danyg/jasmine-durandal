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
	'viewmodels/welcome',
	'viewmodels/error'
], function(Testee, DurandalEnvironment, app, viewLocator, Events, okModule, errorModule){
	window.DEBUG = true;

	xdescribe('WidgetEnvironment', function(){

		it('Has a Public API', function(){
			expect(typeof Testee.prototype.newInstance).toBe('function');
			expect(typeof Testee.prototype.getCurrentInstance).toBe('function');

			// Inherited
			expect(typeof Testee).toBe('function');
			expect(typeof Testee.prototype.init).toBe('function');
			expect(typeof Testee.prototype.configurePlugins).toBe('function');
			expect(typeof Testee.prototype.getModule).toBe('function');
			expect(typeof Testee.prototype.$).toBe('function');
			expect(typeof Testee.prototype.destroy).toBe('function');
		});
		
		// @todo really I need this?
		it('Should extends from DurandalEnvironment', function(){
			expect(Testee.prototype instanceof DurandalEnvironment).toBe(true);
		});

		describe('Functionality', function(){

			beforeEach(function(){
								
				sinon.spy(Testee.prototype, 'destroy');
			});
			afterEach(function(){
				
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

					expect(app.configurePlugins.calledOnce).toBe(true);
					expect(app.start.calledOnce).toBe(true);

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
					expect(okModule.prototype.compositionComplete).toBeDefined(); // composition complete was spyed by WidgetEnvironment

					expect(app.setRoot.calledOnce).toBe(true);
					expect($('body >.WidgetEnvironment')).toBeInDOM();
					
					expect(denv.$('h2')).toEqual($('body >.WidgetEnvironment [data-view="views/welcome"] >h2'));
					expect(denv.$('h2')).toHaveAttr('data-bind');
					expect(denv.$('h2').attr('data-bind')).toEqual('html:displayName');
					expect(denv.$('h2').html()).toEqual('Welcome to the Durandal Starter Kit!');
				});
				runs(function(){
					
					denv.destroy();
					expect(okModule.prototype.compositionComplete).toBeUndefined();
					expect($('body >.WidgetEnvironment')).not.toBeInDOM();
					
				});

			});

			it('error lifecycle', function(){
				var error = false,
					denv
				;
				runs(function(){
					expect(typeof okModule).toBe('function');
					expect(okModule.prototype.compositionComplete).toBeUndefined();
	
					denv = new Testee('viewmodels/error');
					denv.configurePlugins({
						router:true,
						dialog: true,
						widget: true
					});
					viewLocator.useConvention();
					var prom = denv.init()
						.done(function(){
							console.log(' ERROR STARTED ');
							started = true;
						})
						.fail(function(err){
							error = err; // error!
						})
					;
				});
				
				waitsFor(function(){
					return !!error;
				}, 1000);
				
				runs(function(){
					expect(error).toBeDefined();
					expect(error.indexOf('error is not defined')).not.toBe(-1);
					expect(denv.destroy.called).toBe(true);
					expect($('body >.WidgetEnvironment')).not.toBeInDOM();
				});
			});
		});

	});

});