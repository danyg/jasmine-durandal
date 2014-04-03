/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'src/DurandalEnvironment',
	'viewmodels/welcome',
	'durandal/viewLocator',
	'src/jasmine-durandal-1.3x'
], function(DurandalEnvironment, Welcome, viewLocator){

	'use strict';

//	DurandalEnvironment.DEBUG = true;

	describe('the global function exists', function(){
		it('describeModule exists', function(){
			expect(typeof window.describeModule).toBe('function');
		});

		it('xdescribeModule exists', function(){
			expect(typeof window.xdescribeModule).toBe('function');
		});

		it('describeWidget exists', function(){
			expect(typeof window.describeWidget).toBe('function');
		});

		it('xdescribeWidget exists', function(){
			expect(typeof window.xdescribeWidget).toBe('function');
		});

		it('wit exists', function(){
			expect(typeof window.wit).toBe('function');
		});

		it('xwit exists', function(){
			expect(typeof window.xwit).toBe('function');
		});
	});

	describeModule('DurandalEnvironment integrated with jasmine through describeModule', 'viewmodels/welcome', function(){
		var suite = this,
			durandal = this.durandal,
			module
		;

		durandal.beforeStart(function(){
			viewLocator.useConvention();
		});
		durandal.afterStart(function(){
			module = durandal.getModule();
		});

		it('this is a suite', function(){
			expect(suite).toBeDefined();
			expect(suite.constructor).toBe(jasmine.Suite);
		});

		it('Durandal Environment exists', function(){
			expect(durandal).toBeDefined();
		});

		it('Durandal Environment is DurandalEnvironment type', function(){
			expect(durandal instanceof DurandalEnvironment).toBe(true);
		});

		it('Durandal Environment knows the instance of the viewmodel that is being shown', function(){
			expect(durandal.getModule()).toBeDefined();
			expect(durandal.getModule() instanceof Welcome).toBe(true);
		});

		it('the instance of the viewmodel is available on the durandal.beforeStart', function(){
			expect(module).toBe(durandal.getModule());
			expect(module instanceof Welcome).toBe(true);
			expect(module._test).toBeUndefined();
			module._test = '1';
		});

		describe('You can use neested describes', function(){
			it('the instance of the viewmodel is available on the durandal.beforeStart inside of a describe', function(){
				expect(module).toBe(durandal.getModule());
				expect(module instanceof Welcome).toBe(true);

				expect(module._test).toBeUndefined();
				module._test = '1';
			});

			it('the instance of the viewmodel is available on the durandal.beforeStart inside of a describe', function(){
				expect(module).toBe(durandal.getModule());
				expect(module instanceof Welcome).toBe(true);

				expect(module._test).toBeUndefined();
				module._test = '1';
			});

			describe('You can use neested describes', function(){
				it('the instance of the viewmodel is available on the durandal.beforeStart inside of a describe', function(){
					expect(module).toBe(durandal.getModule());
					expect(module instanceof Welcome).toBe(true);

					expect(module._test).toBeUndefined();
					module._test = '1';
				});

				it('the instance of the viewmodel is available on the durandal.beforeStart inside of a describe', function(){
					expect(module).toBe(durandal.getModule());
					expect(module instanceof Welcome).toBe(true);

					expect(module._test).toBeUndefined();
					module._test = '1';
				});

			});

			xdescribeModule('Neested describeModule', 'viewmodels/shell', function(){
				var durandal2 = this.durandal,
					module2
				;
				durandal2.beforeStart(function() {
					viewLocator.useConvention();
				});
				durandal2.afterStart(function() {
					module2 = durandal2.getModule();
				});

				it('neested is not parent (durandal object)', function(){
					expect(durandal2).not.toBe(durandal);
				});

				it('neested is not parent (module object)', function(){
					expect(module2).not.toBe(module);
				});
			});

		});

	});
	
	describe('WidgetEnvironment integrated with jasmine through describeWidget', function(){
		describeWidget('WidgetEnvironment integrated with jasmine through describeWidget', 'good', function(){
			var durandal = this.durandal;

			wit(
				'you can test a widget instance',
				{
					color: 'red',
					title: 'hello'
				},
				function(testee){
					expect(testee).toBeDefined();
					expect(typeof testee.activate).toBe('function');

					expect(testee.color).toBe('red');
					expect(testee.title).toBe('hello');
	//				expect(durandal.$('[data-testid="color"]')[0].style.background).toBe('red');
					expect(durandal.$('[data-testid="title"]')).toHaveHtml('hello');
				}
			);

			describe('1 - Works perfectly in neested describes', function(){
				var settings = {
					color: 'violet',
					title: 'settings tests 1'
				};

				wit('neested wit', settings, function(testee){
					expect(testee).toBeDefined();
					expect(testee instanceof require('widgets/good/viewmodel')).toBe(true);
					expect(typeof testee.activate).toBe('function');

					expect(testee.color).toBe(settings.color);
					expect(testee.title).toBe(settings.title);
	//				expect(durandal.$('[data-testid="color"]')[0].style.background).toBe('rgb(238, 130, 238)');
					expect(durandal.$('[data-testid="title"]')).toHaveHtml(settings.title);
				});

				describe('1.1 - Works perfectly in neested describes', function(){
					var settings = {
						color: 'violet',
						title: 'settings tests 1'
					};

					wit('neested wit', settings, function(testee){
						expect(testee).toBeDefined();
						expect(testee instanceof require('widgets/good/viewmodel')).toBe(true);
						expect(typeof testee.activate).toBe('function');

						expect(testee.color).toBe(settings.color);
						expect(testee.title).toBe(settings.title);
	//					expect(durandal.$('[data-testid="color"]')).toHaveCss({backgroundColor: settings.color});
						expect(durandal.$('[data-testid="title"]')).toHaveHtml(settings.title);
					});

					describe('1.1.1 - Works perfectly in neested describes', function(){
						var settings = {
							color: 'violet',
							title: 'settings tests 1'
						};

						wit('neested wit', settings, function(testee){
							expect(testee).toBeDefined();
							expect(testee instanceof require('widgets/good/viewmodel')).toBe(true);
							expect(typeof testee.activate).toBe('function');

							expect(testee.color).toBe(settings.color);
							expect(testee.title).toBe(settings.title);
	//						expect(durandal.$('[data-testid="color"]')).toHaveCss({backgroundColor: settings.color});
							expect(durandal.$('[data-testid="title"]')).toHaveHtml(settings.title);
						});
					});

				});

				var colors = ['red', 'blue', 'pink', '#ff0000', '#123456', '#654321', '#abcdef', 'black', '#ff00ff', '#ffff00', '#33ff66'];
				function setALotOfTimes(i){
					var settings = {
						color: colors[i],
						title: 'settings tests ' + i
					},
						lastTestee
					;
					wit('runs a lot of times (' + (i+1) +')' , settings, function(testee){
						expect(testee).not.toBe(lastTestee);
						expect(testee).toBeDefined();
						expect(testee instanceof require('widgets/good/viewmodel')).toBe(true);
						expect(typeof testee.activate).toBe('function');

						expect(testee.color).toBe(settings.color);
						expect(testee.title).toBe(settings.title);
	//					expect(durandal.$('[data-testid="color"]')).toHaveCss({backgroundColor: settings.color});
						expect(durandal.$('[data-testid="title"]')).toHaveHtml(settings.title);
						lastTestee = testee;
					});

				}

				for(var i = 0; i < 10; i++){
					setALotOfTimes(i);
				}
			});

		});
/*
		describe('WidgetEnvironment integrated with jasmine through describeWidget', 'missingview', function(){
			wit('Checking mixups', {color: 'red',title: 'hello'}, function(inst){
				expected(inst).toBe(defined);
			});
		});

		describeWidget('WidgetEnvironment integrated with jasmine through describeWidget', 'good', function(){
			wit('Checking mixups', {color: 'red',title: 'hello'}, function(inst){
				expected(inst).toBe(defined);
			});
		});

		describeWidget('WidgetEnvironment integrated with jasmine through describeWidget', 'missingview', function(){
			wit('Checking mixups', {color: 'red',title: 'hello'}, function(inst){
				expected(inst).toBe(defined);
			});
		});

		describeWidget('WidgetEnvironment integrated with jasmine through describeWidget', 'good', function(){
			wit('Checking mixups', {color: 'red',title: 'hello'}, function(inst){
				expected(inst).toBe(defined);
			});
		});
*/
	});
});
