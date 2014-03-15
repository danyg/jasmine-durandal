/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['./DurandalEnvironment'], function(DurandalEnvironment){
	'use strict';
	window.describeModule = function(description, moduleId, specDefinitions){
		var suite = jasmine.getEnv().describe(description, function(){
			this.durandal = new DurandalEnvironment(moduleId);
			this.execute = function(onComplete){
				var self = this;
				
				var _onComplete = onComplete;
				onComplete = function(){
					self.durandal.destroy();
					return _onComplete();
				};
				
				this.durandal.init()
					.done(function(){
						self.queue.start(function() {
							self.finish(onComplete);
						});
					})
					.fail(function(err){
						self.fail(err);
					})
				;
				
			};
			
			specDefinitions.call(this);
		});
		
		
		return suite;
	};
	
});
