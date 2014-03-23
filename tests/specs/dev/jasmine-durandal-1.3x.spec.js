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
			
		});
		
	});
	
});