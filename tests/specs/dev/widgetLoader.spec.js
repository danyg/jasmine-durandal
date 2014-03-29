/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define([
	'src/widgetLoader',
	'src/jasmine-durandal-1.3x'
], function(){
	
	'use strict';

	describe('widgetLoader is there', function(){
		it(' is defined in require context', function(){
			expect(typeof require('widgetLoader')).toBe('object');
		});
		
		it('Has an API', function(){
			var module = require('widgetLoader');
			expect(typeof module.setSettings).toBe('function');
			
			// inherited from Event;
			expect(typeof module.on).toBe('function');
			expect(typeof module.trigger).toBe('function');
			expect(typeof module.off).toBe('function');
			expect(typeof module.proxy).toBe('function');
		});
	});

	describeModule('widgetLoader', 'widgetLoader', function(){
		var durandal = this.durandal,
			module
		;
		
		durandal.configurePlugins({
			widget: true
		});
		
		durandal.afterStart(function(){
			module = durandal.getModule();
		});
		

		it('the view of widgetLoader is loaded', function(){
			expect(durandal.$('#widgetLoader')).toBeInDOM();
		});
		
		it('should trigger newInstance method after setSettings is called', function(){
			var triggered = false,
				sub
			;

			runs(function(){
				sub = module.on('newInstance_123').then(function(){
					triggered = true;
				});
				
				module.setSettings({
					kind: 'good',
					color: 'red',
					title: 'RED John'
				}, '123');
			});
			
			waitsFor(function(){
				return triggered;
			}, 1000);
			
			runs(function(){
				expect(triggered).toBe(true);
				sub.off();
			});
		});
		
		it('should preserve the original attached hook', function(){
			var cc = false;
			
			runs(function(){
				cc = false;
				module.setSettings({
					kind: 'good',
					color: 'red',
					title: 'RED John',

					attached: function(){
						cc = true;
					}
				});
			});

			waitsFor(function(){
				return cc;
			}, 1000);
			
			runs(function(){
				expect(cc).toBe(true);
			});
		});

		it('should load a new widget when setSettings is called', function(){
			var widget = false,
				oldWidget,
				triggered = false,
				sub
			;

			runs(function(){
				sub = module.on('newInstance_111').then(function(module){
					widget = module;
					triggered = true;
				});
			});

			runs(function(){
				triggered = false;
				
				module.setSettings({
					kind: 'good',
					color: 'red',
					title: 'RED John'
				}, '111');
			});
			
			waitsFor(function(){
				return triggered;
			}, 1000);
			
			runs(function(){
				expect(widget).not.toBe(false);
				oldWidget = widget;
			});
			
			runs(function(){
				triggered = false;
				
				module.setSettings({
					kind: 'good',
					color: 'red',
					title: 'RED John'
				}, '111');
			});
			
			waitsFor(function(){
				return triggered;
			}, 1000);
			
			runs(function(){
				expect(widget).not.toBe(oldWidget);
			});

			runs(function(){
				sub.off();
			});
		});
		
	});
	
});
