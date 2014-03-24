/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define([
	'src/widgetLoader'
], function(){
	
	'use strict';
	
	describeModule('widgetLoader', 'widgetLoader', function(){
		var durandal = this.durandal,
			module
		;
		
		durandal.afterStart(function(){
			module = durandal.getModule();
		});
		
		it('Has an API', function(){
			expect(typeof module.setSettings).toBe('function');
		});

		it('the view of widgetLoader is loaded', function(){
			expect(durandal.$('#widgetLoader')).toBeInDOM();
		});
		
	});
	
});
