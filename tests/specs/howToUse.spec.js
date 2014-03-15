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
], function(DurandalEnvironment, testee){
	
	describeModule('Welcome Module', 'viewmodels/welcome', function(){
		var durandal = this.durandal,
			module
		;
		
		beforeEach(function(){
			module = durandal.getModule();
		});
		
		it('should display the correct title', function(){
			expect(durandal.$('h2').html()).toEqual(module.displayName);
		});
		
		it('should display the correct description', function(){
			expect(durandal.$('blockquote').html()).toEqual(module.description);
		});
		
		it('should display the correct amount of features', function(){
			expect(durandal.$('ul li').length).toBe(module.features.length);
		});
	});
	
});