/*
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([
	'./DurandalEnvironment',
	'./WidgetEnvironment'
], function(DurandalEnvironment, WidgetEnvironment) {
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
	window.xdescribeWidget = function(description, moduleId, specDefinition){
		xdescribe(description, specDefinition);
	};

	function createSuiteOnExecute(suite, durandal){
		var oldExecute = suite.execute;
		return function(onComplete){
			var i, spec;

			var initDurEnv = function(){
				return durandal.init();
			};
			var endDurEnv = function(){
				return durandal.destroy();
			};

			var oldOnComplete = onComplete;
			onComplete = function(){
				durandal.destroy();

				return oldOnComplete.apply(this, arguments);
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

			return oldExecute.call(this, onComplete);
		};
	}

	/**
	 *
	 * @param {jasmine.Spec} me
	 * @returns {jasmine.Suite}
	 */
	function findSuiteWithDurandal(me){
		if(me.suite){
			var suite = me.suite,
				cont = true;

			while(cont){
				if(suite.durandal){

					cont = false;
				}else{
					suite = !!suite.parentSuite ? suite.parentSuite : false;
					cont = !!suite;
				}
			}

			return suite;
		}
		return false;
	}

	window.describeModule = function(description, moduleId, specDefinitions) {
		var suite = jasmine.getEnv().describe(description, function() {

			this.durandal = new DurandalEnvironment(moduleId);
			this.execute = createSuiteOnExecute(this, this.durandal);

			specDefinitions.call(this);
		});


		return suite;
	};

	window.describeWidget = function(description, widgetId, specDefinitions) {
		var suite = jasmine.getEnv().describe(description, function() {

			this.durandal = new WidgetEnvironment(widgetId);
			this.execute = createSuiteOnExecute(this, this.durandal);

			specDefinitions.apply(this, arguments);
		});


		return suite;
	};

	window.wit = function(desc, settings, itDefinition) {
		return jasmine.getEnv().it(desc, function(){
			var suite = findSuiteWithDurandal(this),
				spec = this
			;

			this.after(function(){
				suite.durandal.destroyWidget();
			});

			var started = false;
			spec.waitsFor(function(){
				return started;
			}, 15000, 'Widget Initialization Timeout');

			suite.durandal.newInstance(settings)
				.done(function(){
					started = true;
					try {
						itDefinition.call(this, suite.durandal.getCurrentInstance());
					} catch(e) {
						spec.fail(e);
					}
				})
				.fail(function(e){
					started = true;
					spec.fail(e);
					//@todo do something
				});
		});
	};

	window.xwit = function(desc, settings, itDefinition) {
		return window.xit(desc, itDefinition);
	};

});
