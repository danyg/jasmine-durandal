/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['./DurandalEnvironment'], function(DurandalEnvironment) {
	'use strict';

	function DeferredBlock() {
		jasmine.Block.apply(this, arguments);
	}

	jasmine.util.inherit(DeferredBlock, jasmine.Block);

	DeferredBlock.prototype.execute = function(onComplete) {
		var self = this;
		try {
			this.func.apply(this.spec)
				.done(function(){
					console.log('Lo Que Sea Complete');
					onComplete();
				})
				.fail(function(e){
					console.log('Lo Que Sea Failed', arguments);
					self.spec.fail(e);
					onComplete();
				})
			;

		} catch (e) {
			this.spec.fail(e);
		}
	};


	window.xdescribeModule = function(description){
		xdescribe(description);
	};
	
	function createSuiteOnExecute(suite, durandal){
		var oldExecute = suite.execute;
		return function(){
			var i, spec, self = this;

			var initDurEnv = function(){
				console.log('%cINIT', 'background: #000; color: #f00;');
				return durandal.init();
			};
			var endDurEnv = function(){
				console.log('%cDESTROY', 'background: #000; color: #f00;');
				return durandal.destroy();
			};

			for(i = 0; i < this.queue.blocks.length; i++){
				spec = this.queue.blocks[i];
				if(spec instanceof jasmine.Spec){
					spec.queue.addBefore(new DeferredBlock(spec.env, initDurEnv, spec));
					spec.queue.add(new DeferredBlock(spec.env, endDurEnv, spec));
				}
				if(spec instanceof jasmine.Suite){
					spec.execute = createSuiteOnExecute(spec, durandal);
				}
			}
			return oldExecute.apply(this, arguments);
		};
	};

	window.describeModule = function(description, moduleId, specDefinitions) {
		var suite = jasmine.getEnv().describe(description, function() {
			var self = this;
			this.durandal = new DurandalEnvironment(moduleId);


			this.execute = createSuiteOnExecute(this, this.durandal);

			specDefinitions.call(this);
		});


		return suite;
	};

});
