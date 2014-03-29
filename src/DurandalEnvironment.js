/*
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([
	'./SpyStub',
	'./_log',
	'./viewEngineNotifier',
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
