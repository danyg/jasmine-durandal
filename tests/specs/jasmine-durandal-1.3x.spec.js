/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'src/DurandalEnvironment',
	'viewmodels/welcome',
	'src/jasmine-durandal-1.3x'
], function(DurandalEnvironment, Welcome){
	
	describeModule('DurandalEnvironment integrated with jasmine through describeModule', 'viewmodels/welcome', function(){
		var suite = this;
		var durandal = this.durandal;
		
		beforeEach(function(){
			module = durandal.getModule();
		});
		
		it('this is a suite', function(){
			expect(suite).toBeDefined();
		});
		
		it('this is a suite', function(){
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
		
		it('the instance of the viewmodel is available on the beforeEach', function(){
			expect(module).toBe(durandal.getModule());
			expect(module instanceof Welcome).toBe(true);
		});
		
	});
	
});