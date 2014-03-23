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
					onComplete();
				})
				.fail(function(e){
					self.spec.fail(e);
					onComplete();
				})
			;

		} catch (e) {
			this.spec.fail(e);
			onComplete();
		}
	};


	window.xdescribeModule = function(description, moduleId, specDefinition){
		xdescribe(description, specDefinition);
	};

	function createSuiteOnExecute(suite, durandal){
		var oldExecute = suite.execute;
		return function(){
			var i, spec;

			var initDurEnv = function(){
				return durandal.init();
			};
			var endDurEnv = function(){
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
	}

	window.describeModule = function(description, moduleId, specDefinitions) {
		var suite = jasmine.getEnv().describe(description, function() {

			this.durandal = new DurandalEnvironment(moduleId);
			this.execute = createSuiteOnExecute(this, this.durandal);
			
			specDefinitions.call(this);
		});


		return suite;
	};

});
