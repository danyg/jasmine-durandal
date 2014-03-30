/*
The MIT License (MIT)

Copyright (c) 2013-2014 Daniel Goberitz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function(){

	// ** @file E:\DevelKepler\durandal-jasmine\src\DurandalEnvironment.js
	/*
	 *
	 *  @overview
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 *
	 */
	
	define('/__jasmine-durandal__/DurandalEnvironment', [
		'/__jasmine-durandal__/SpyStub',
		'/__jasmine-durandal__/_log',
		'/__jasmine-durandal__/viewEngineNotifier',
		'durandal/system',
		'durandal/app',
		'durandal/events',
		'durandal/composition',
		'durandal/binder',
		'durandal/viewLocator',
		'jquery'
	], function(SpyStub, _log, viewEngineNotifier, system, app, Events, composition, binder, viewLocator, $){
	
		'use strict';
	
		
		function DurandalEnvironment(moduleId){
			var me = this;
	
			this._moduleId = moduleId;
			this._viewEngineSubscriptions = [];
			this._viewId = moduleId; // calculated in init
			this._id = system.guid();
			this._toRestore = [];
			this._log('INFO', 'CREATING');
	
			this.on('ERROR', function(){
				me.destroy();
			});
	
			this._plugins = {};
		}
	
		Events.includeIn(DurandalEnvironment.prototype);
	
		DurandalEnvironment.DEBUG = false;
	
		DurandalEnvironment.prototype.isInit = function(){
			return !!this._finalized;
		};
		
		DurandalEnvironment.prototype.init = function(){
			this._log('INFO', 'INIT');
			var me = this;
			this._finalized = false;
			return system.defer(function(defer){
				me.trigger('beforeStart');
				setTimeout(function(){
					me._destroyThenStart(defer);
				}, 1);
			}).promise();
		};
	
		DurandalEnvironment.prototype._destroyThenStart = function(defer){
			this._log('DEBUG', 'DESTROY THEN START');
	
	
	
			var me = this;
	
			this.destroy()
				.done(function(){
					me._start(defer);
				})
				.fail(function(e){
					this._log('warning', 'INIT DEFER REJECTED because destroy fails');
					defer.reject(e);
				})
			;
		};
	
		DurandalEnvironment.prototype._listenViewEngine = function(){
			var me = this;
			this._viewId = viewLocator.convertModuleIdToViewId(this._moduleId);
	
			this._cleanViewEngineSubscribers();
	
			this._viewEngineSubscriptions.push(viewEngineNotifier
				.on('missingView_' + this._viewId + ' compositionFail_' + this._viewId)
					.then(function(e){
						me.trigger('ERROR', e);
					})
			);
		};
	
		DurandalEnvironment.prototype._cleanViewEngineSubscribers = function(){
			var i;
			if(this._viewEngineSubscriptions.length > 0){
				for(i = 0; i < this._viewEngineSubscriptions.length; i++){
					this._viewEngineSubscriptions[i].off();
				}
			}
		};
	
		DurandalEnvironment.prototype._start = function(defer){
			this._listenViewEngine();
			this._log('INFO', 'STARTING');
			var me = this;
	
	//		system.debug(true);
			this._stub(system, 'error', function(log){
				me.trigger('ERROR', log.message);
			});
			this._spyModule().done(function(){
				var errSub, endSub;
	
				errSub = me.on('ERROR').then(function(e){
					me._log('ERROR', e);
					endSub.off();
					me._log('WARNING', 'INIT DEFER REJECTED because error:');
					defer.reject(e);
				});
				endSub = me.on('renderEnd').then(function(){
					me._log('DEBUG', 'renderEnds');
					me._log('INFO', 'INIT DEFER RESOLVED because renderEnds');
					defer.resolve();
					errSub.off();
				});
	
				me._createRootElement();
				me._startApp();
			}).fail(function(){
				defer.reject('DurandalEnvironment: Error acquiring the module: ' + me._moduleId);
			});
		};
	
		DurandalEnvironment.prototype.configurePlugins = function(plugins){
			this._plugins = plugins;
		};
	
		DurandalEnvironment.prototype.$ = function(selector){
			return $(selector, this._moduleIdElement);
		};
	
		DurandalEnvironment.prototype.getModule = function(){
			return this._testModule;
		};
	
		DurandalEnvironment.prototype.destroy = function(){
			var me = this;
			this._log('WARN', 'DESTROY');
			return system.defer(function(defer){
				me._destroy(defer);
			}).promise();
		};
	
		DurandalEnvironment.prototype._destroy = function(defer){
			this._log('INFO','DESTROING');
	
			this._cleanViewEngineSubscribers();
			this._restoreStubSpy();
	
			if(!this._container || !this._container.parentNode){
				this._log('DEBUG', 'DESTROYED nothing to destroy');
				defer.resolve();
			}else{
	
				try{
					$(this._container).remove();
					var containerOnDom = true;
					while(containerOnDom){
						containerOnDom = $('#' + this._id).length > 0;
						$('#' + this._id).parent().remove();
					}
					this._log('DEBUG', 'DESTROYED real destroy');
					defer.resolve();
				}catch(e){
					this._log('ERROR', 'DESTROYED FAIL: ', e);
					if(DurandalEnvironment.DEBUG){
						window.console.log(!!e.stack ? e.stack : 'NO STACKTRACE INFORMED');
					}
					defer.reject(e);
				}
			}
	
		};
	
		DurandalEnvironment.prototype._restoreStubSpy = function(){
			if(this._toRestore.length > 0){
				var i;
				for(i = 0; i < this._toRestore.length; i++){
					this._toRestore[i].restore();
				}
			}
		};
	
		DurandalEnvironment.prototype.beforeStart = function(cbk){
			this.on('beforeStart', cbk);
		};
	
		DurandalEnvironment.prototype.afterStart = function(cbk){
			this.on('afterStart', cbk);
		};
	
		DurandalEnvironment.prototype._stub = function(parent, method, code){
			var stub = new SpyStub(parent, method);
			stub.stub(code);
			this._toRestore.push(stub);
		};
	
		DurandalEnvironment.prototype._spy = function(parent, method, code){
			var spy = new SpyStub(parent, method);
			spy.spy(code);
			this._toRestore.push(spy);
		};
	
		DurandalEnvironment.prototype._spyModule = function(){
			var me = this,
				defer = system.defer()
			;
			me._log('INFO', 'system.acquire LISTEN UP ', this._moduleId);
			system.acquire(this._moduleId)
				.done(function(module){
					me._log('DEBUG', 'system.acquire DONE');
					me._prepareToStoreModule(module);
					defer.resolve();
				})
				.fail(function(err){
					me._log('ERROR', 'system.acquire DONE');
					me.trigger('ERROR', new URIError('Module ' + me._moduleId + ' Can\'t be acquired REASON:' + err));
					defer.reject();
				})
			;
	
			return defer.promise();
		};
	
		DurandalEnvironment.prototype._prepareToStoreModule = function(module){
			var me = this,
				bindAndShowStub,
				origBindAndShow = composition.bindAndShow,
				origFinalize = composition.finalize
			;
	
			this._module = module;
	
			bindAndShowStub = new SpyStub(composition, 'bindAndShow');
			bindAndShowStub.stub(function(child, context){
				me._log('debug', 'bindAndShow Response');
				if(context.model.__moduleId__ === me._moduleId){
					me._testModule = context.model;
					me._log('debug', 'testModule Setted');
					bindAndShowStub.restore();
				}
	
				return origBindAndShow.apply(this, arguments);
			});
	
			this._stub(composition, 'finalize', function(context){
				// WHEN FINALIZE ENDS, then you have a view rendered in order to interact with... there is no any other solution (deferred...) to know when a view is completed
				var ret = origFinalize.apply(this, arguments);
	
				me._onViewRendererAndVisible(context);
	
				return ret;
			});
	
		};
	
		DurandalEnvironment.prototype._onViewRendererAndVisible = function(context){
			if(false === this._finalized && context.model === this._testModule){
				this._finalized = true;
				this._restoreStubSpy();
	
				this._moduleViewElement = context.child;
	
				this.trigger('afterStart');
				this.trigger('renderEnd');
			}
		};
	
		DurandalEnvironment.prototype._createRootElement = function(){
			if(!this._container || !this._container.parentNode){
				
				this._moduleIdElement = document.createElement('div');
				this._moduleIdElement.id = this._id;
	
				this._moduleIdElement.style.width = '1920px';
				this._moduleIdElement.style.height = '1080px';
	
				this._container = document.createElement('div');
				this._container.className = 'DurandalEnvironment';
				this._container.style.position = 'absolute';
	
				if(system.debug()){
					this._container.style.left = '50%';
					this._container.style.top = '50%';
					this._container.style.marginLeft = '-320px';
					this._container.style.marginTop = '-240px';
				}else{
					this._container.style.left = '-640px';
					this._container.style.top = '-480px';
				}
	
				this._container.style.width = '640px';
				this._container.style.height = '480px';
				this._container.style.overflow = 'scroll';
				this._container.style.border = 'solid 1px black';
				this._container.style.zIndex = '10';
				this._container.style.background = 'white';
	
				document.body.appendChild(this._container);
				this._container.appendChild(this._moduleIdElement);
			}
		};
	
		DurandalEnvironment.prototype._startApp = function(){
			var me = this;
	
			if(this._plugins){
				app.configurePlugins(this._plugins);
			}
	
			binder.throwOnErrors = true;
			app.start().then(function(){
				app.setRoot(me._moduleId, undefined, me._id);
			});
		};
	
		DurandalEnvironment.prototype._log = function(){
			var args = Array.prototype.splice.call(arguments, 0);
			args.push('[' + this._moduleId + ' with elementId: ' + this._id + ']');
			_log.apply(null, args);
		};
	
	
		return DurandalEnvironment;
	});
	
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\SpyStub.js
	/**
	 *
	 *  @overview
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 *
	 */
	
	define('/__jasmine-durandal__/SpyStub', [], function(){
	
		'use strict';
	
		function SpyStub(parent, method){
			this._parent = parent;
			this._method = method;
			this._original = false;
	
			if(!!this._parent[this._method]){
				this._original = this._parent[this._method];
			}
		}
	
		SpyStub.prototype.applyOriginal = function(args){
			return this._original.apply(this._parent, args);
		};
		
		SpyStub.prototype.stub = function(code){
			if(!code){
				code = function(){
					return true;
				};
			}
			this._parent[this._method] = code;
		};
	
		SpyStub.prototype.spy = function(code){
			var me = this;
			
			if(typeof code !== 'function'){
				throw new TypeError('code must be a function');
			}
			
			if(this._original !== false){
				this._parent[this._method] = function(){
					var retvalue = me._original.apply(this, arguments);
					code(retvalue);
					return retvalue;
				};
			}else{
				this._parent[this._method] = function(){
					code();
				};
			}
		};
	
		SpyStub.prototype.restore = function(){
			if(this._original !== false){
				this._parent[this._method] = this._original;
			}else{
				delete this._parent[this._method];
			}
		};
	
		return SpyStub;
	});
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\WidgetEnvironment.js
	/**
	 *
	 *  @overview
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 *
	 */
	define('/__jasmine-durandal__/WidgetEnvironment', [
		'/__jasmine-durandal__/DurandalEnvironment',
		'/__jasmine-durandal__/viewEngineNotifier',
		'durandal/events',
		'durandal/system',
		'plugins/widget',
		'jquery',
		'/__jasmine-durandal__/widgetLoader'
	], function(DurandalEnvironment, viewEngineNotifier, Events, system, widget, $){
	
		'use strict';
		
		function WidgetEnvironment(widgetId){
	
			this._widgetId = widgetId;
			this._widgetModuleId = widget.mapKindToModuleId(widgetId);
			this._widgetViewId = widget.mapKindToViewId(widgetId);
			
			this._myId = system.guid();
			this._denv = new DurandalEnvironment('widgetLoader');
			this._denv.configurePlugins({
				widget: true
			});
	
			this._denv.on('ERROR').then(this.proxy('ERROR'));
			viewEngineNotifier.on('missingView_' + this._widgetViewId)
				.then(this.proxy('ERROR'))
			;
	
			this._errSubscription = undefined;
			this._settings = undefined;
			this._widget = undefined;
			this._newInstanceSubscription = undefined;
		}
		
		Events.includeIn(WidgetEnvironment.prototype);
		
		WidgetEnvironment.prototype.init = function(){
			return this._denv.init();
		};
		
		WidgetEnvironment.prototype.newInstance = function(settings){
			var me = this;
			if(settings === undefined){
				throw new TypeError('You should send an object settings to ' + this.constructor.name + '.newInstance');
			}
			this._settings = settings;
			this._settings.kind = this._widgetId;
	
			return system.defer(function(defer){
				try{
					me._newInstance(defer);
				}catch(e){
					defer.reject(e);
				}
			}).promise();
		};
		
		WidgetEnvironment.prototype.$ = function(selector){
			return $(selector, this._layer);
		};
		
		WidgetEnvironment.prototype.getCurrentInstance = function(){
			return this._widget;
		};
		
		WidgetEnvironment.prototype.destroy = function(){
			return this._denv.destroy();
		};
		WidgetEnvironment.prototype.destroyWidget = function(){
			if(!!this._errSubscription){
				this._errSubscription.off();
			}
			if(this._newInstanceSubscription){
				this._newInstanceSubscription.off();
			}
			this._widgetLoader.setSettings(false);
		};
		
		WidgetEnvironment.prototype._newInstance = function(defer){
			var me = this;
			if(!!this._errSubscription){
				this._errSubscription.off();
			}
			this._errSubscription = this.on('ERROR', function(err){
				defer.reject(err);
			});
			defer.fail(function(){
				me.destroy();
			});
			
			if(!this._denv.isInit()){
				this._denv.init()
					.then(
						function(){
							me._startWidget(defer);
						},
						defer.reject
					)
				;
			}else{
				this._startWidget(defer);
			}
		};
		
		WidgetEnvironment.prototype._listenWidgetLoader = function(defer){
			this._widgetLoader = this._denv.getModule();
			var me = this;
			
			if(this._newInstanceSubscription){
				this._newInstanceSubscription.off();
			}
	
			this._newInstanceSubscription = this._widgetLoader.on('newInstance_' + this._myId)
				.then(function(widget, child){
					me._widget = widget;
					me._layer = child;
					me._newInstanceSubscription.off();
					defer.resolve(widget);
				})
			;
		};
		WidgetEnvironment.prototype._startWidget = function(defer){
			this._listenWidgetLoader(defer);
			this._widgetLoader.setSettings(this._settings, this._myId);
		};
		
		return WidgetEnvironment;
	});
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\_log.js
	/* 
	 * 
	 *  @overview 
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 * 
	 */
	
	define('/__jasmine-durandal__/_log', ['durandal/system'], function(system){
		'use strict';
		
		/**
		 * 
		 * @param {type} lvl
		 * @param {...} msg
		 * @returns {undefined}
		 */
		function _log(lvl, args){
			if(!system.debug()){
				return;
			}
			lvl = arguments[0].toString().toUpperCase();
			args = Array.prototype.splice.call(arguments, 1);
	
			if(!!window.navigator.vendor && (window.navigator.vendor.match(/google/i) || window.navigator.vendor.match(/mozilla/i) )){
				var css;
				switch(lvl){
				case 'INFO':
					css = 'background: skyblue; color: black;';
					break;
				case 'WARN':
					css = 'background: orange; color: black;';
					break;
				case 'ERROR':
					css = 'background: red; color: white; font-size: 1.2em;';
					break;
				case 'DEBUG':
					css = 'background: green; color: white';
					break;
				}
	
				window.console.log('%c' + args.join(' '), css);
			}else{
				window.console.log(lvl + ': ' + args.join(' '));
			}
	
		}
	
		return _log;
	});
	
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\viewEngineNotifier.js
	/*
	 *
	 *  @overview
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 *
	 */
	
	define('/__jasmine-durandal__/viewEngineNotifier', [
		'/__jasmine-durandal__/SpyStub',
		'/__jasmine-durandal__/_log',
		'durandal/events',
		'durandal/viewEngine',
		'durandal/system'
	], function(SpyStub, _log, Events, viewEngine, system){
		'use strict';
		
		var viewEngineNotifier = {
			createFallbackViewStub: null,
			_setUp: function(){
				var me = this;
				this.createFallbackViewStub = new SpyStub(viewEngine, 'createFallbackView');
	
				this.createFallbackViewStub.stub(function(viewId, requirePath, err){
					return system.defer(function(defer){
						var message = 'View Not Found. Searched for "' + viewId + '" via path "' + requirePath + '".';
						_log('ERROR', message, '[' + viewId + ']');
						me.trigger('missingView_' + viewId, message);
						defer.reject(message);
						throw err;
					}).promise();
				});
			}
		};
	
		Events.includeIn(viewEngineNotifier);
		viewEngineNotifier._setUp();
	
		return viewEngineNotifier;
	});
	
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\widgetLoader.js
	/* 
	 * 
	 *  @overview 
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 * 
	 */
	
	(function(){
		'use strict';
		
		define('widgetLoader', ['knockout', 'durandal/events'], function(ko, Events){
			var widgetLoader = {
				_widgetSettings: ko.observable(),
				_widgetInstance: null,
	
				setSettings: function(settings, id){
					var me = this;
					var myAttached = function(child, parent, context){
						me._widgetInstance = context.model;
						me.trigger('newInstance_' + id, context.model, child);
					};
					if(!!settings.attached){
						var oldAttached = settings.attached;
						settings.attached = function(){
							myAttached.apply(this, arguments);
							return oldAttached.apply(this, arguments);
						};
					}else{
						settings.attached = function(){
							myAttached.apply(this, arguments);
						};
					}
					
					this._widgetSettings(settings);
				},
				
				getWidgetInstance: function(){
					return this._widgetInstance;
				}
			};
			
			Events.includeIn(widgetLoader);
			
			return widgetLoader;
		});
	
		define('text!widgetLoader.html', [], function(){
	
			return '<div id="widgetLoader">' +
				'<!-- ko if: !!_widgetSettings() -->' +
					'<div id="widgetContainer" data-bind="widget: $root._widgetSettings">' +
					'</div>' +
				'<!-- /ko -->' +
			'</div>';
		});
	
		define('/__jasmine-durandal__/widgetLoader', ['widgetLoader'], function(){
			return true; // just for advise
		});
	
	}());
	
	
	// ** @file E:\DevelKepler\durandal-jasmine\src\jasmine-durandal-1.3x.js
	/*
	 *
	 *  @overview
	 *  @author Daniel Goberitz <dalgo86@gmail.com>
	 *
	 */
	
	define([
		'/__jasmine-durandal__/DurandalEnvironment',
		'/__jasmine-durandal__/WidgetEnvironment'
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
				var suite = findSuiteWithDurandal(this);
	
				this.after(function(){
					suite.durandal.destroyWidget();
				});
	
				suite.durandal.newInstance(settings)
					.done(function(){
						itDefinition.call(this, suite.durandal.getCurrentInstance());
					})
					.fail(function(){
						//@todo do something
				});
			});
		};
	
		window.xwit = function(desc, settings, itDefinition) {
			return window.xit(desc, itDefinition);
		};
	
	});
	
	
}());