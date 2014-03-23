/*
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([
	'./SpyStub',
	'durandal/system',
	'durandal/app',
	'durandal/events',
	'durandal/composition',
	'durandal/binder',
	'durandal/viewEngine',
	'jquery'
], function(SpyStub, system, app, Events, composition, binder, viewEngine, $){

	'use strict';
	function DurandalEnvironment(moduleId){
		var me = this;

		this._originalCompositionComplete = false;
		this._moduleId = moduleId;
		this._id = system.guid();
		this._toRestore = [];

		this.on('ERROR', function(){
			me.destroy();
		});

		viewEngine.createFallbackView = function(viewId, requirePath, err){
			return system.defer(function(defer){
				var message = 'View Not Found. Searched for "' + viewId + '" via path "' + requirePath + '".';
				me.trigger('ERROR', message);
				defer.reject(message);
				throw err;
			}).promise();
		};

		this._plugins = {};
	}

	Events.includeIn(DurandalEnvironment.prototype);

	DurandalEnvironment.DEBUG = false;

	DurandalEnvironment.prototype.init = function(){
		var me = this;
		return system.defer(function(defer){
			me.trigger('beforeStart');
			setTimeout(function(){
				me._destroyThenStart(defer);
			}, 1);
			setTimeout(function(){
				if(defer.state() === 'pending'){
					defer.reject('To many time');
				}
			}, 5000);
		}).promise();
	};

	DurandalEnvironment.prototype._destroyThenStart = function(defer){
		var me = this;
		
		this.destroy()
			.done(function(){
				me._start(defer);
			})
			.fail(function(e){
				defer.reject(e);
			})
		;
	};
	
	DurandalEnvironment.prototype._start = function(defer){
console.log('%cSTARTING: ' + this._moduleId, 'background: skyblue; color: black;');
		var me = this;

		system.debug(true);
		this._stub(system, 'error', function(log){
			me.trigger('ERROR', log.message);
		});
		this._spyModule();

		var errSub, endSub;

		errSub = this.on('ERROR').then(function(e){
console.log('%cERROR: ' + this._moduleId + ': ' + e, 'background: red; color: white;');
			endSub.off();
			defer.reject(e);
		});
		endSub = this.on('compositionComplete').then(function(){
console.log('%ccompositionComplete: ' + this._moduleId, 'background: green; color: white;');
			defer.resolve();
			errSub.off();
		});

		this._createRootElement();
		this._startApp();		
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
		return system.defer(function(defer){
			me._destroy(defer);
		}).promise();
	};
	
	DurandalEnvironment.prototype._destroy = function(defer){
console.log('%cDESTROING: ' + this._moduleId, 'background: skyblue; color: black;');
		if(this._toRestore.length > 0){
			var i;
			for(i = 0; i < this._toRestore.length; i++){
				this._toRestore[i].restore();
			}
		}

		if(!this._container || !this._container.parentNode){
console.log('%cDESTROYED 1: ' + this._moduleId, 'background: green; color: white;');
			defer.resolve();
		}else{

			try{
				$(this._container).remove();
				var containerOnDom = true;
				while(containerOnDom){
					containerOnDom = !!this._container.parentNode;
				}
	console.log('%cDESTROYED 2: ' + this._moduleId, 'background: green; color: white;');
				defer.resolve();
			}catch(e){
	console.log('%cDESTROYED FAIL: ' + this._moduleId + ': ' +e, 'background: red; color: white;');
	console.error(e.stack);
				defer.reject(e);
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
		var me = this;
		system.acquire(this._moduleId)
			.done(function(module){
				me._storeModule(module);
				me._spyCompositionComplete(module);
			})
			.fail(function(err){
				me.trigger('ERROR', new URIError('Module ' + me._moduleId + ' Can\'t be acquired REASON:' + err));
			})
		;
	};

	DurandalEnvironment.prototype._storeModule = function(module){
		var me = this;
		this._module = module;

		if(typeof module !== 'function'){
			this._testModule = module;
		}else{
			var orig = composition.bindAndShow;
			this._stub(composition, 'bindAndShow', function(child, context){
				me._testModule = context.model;
				return orig.apply(this, arguments);
			});
		}
	};

	DurandalEnvironment.prototype._spyCompositionComplete = function(){
		var me = this,
			target = this._module
		;

		if(typeof target === 'function'){
			target = this._module.prototype;
		}

		this._spy(target, 'compositionComplete', function(promise){
			if(!!promise && !!promise.then){
				promise.then(function(){
					me.trigger('afterStart');
					me.trigger('compositionComplete');
				});
			}else{
				me.trigger('afterStart');			// this enable the getModule reach
				me.trigger('compositionComplete'); // this execute the suite
			}
		});
	};

	DurandalEnvironment.prototype._createRootElement = function(){
		this._moduleIdElement = document.createElement('div');
		this._moduleIdElement.id = this._id;

		this._moduleIdElement.style.width = '1920px';
		this._moduleIdElement.style.height = '1080px';

		this._container = document.createElement('div');
		this._container.className = 'DurandalEnvironment';
		this._container.style.position = 'absolute';

		if(DurandalEnvironment.DEBUG){
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

	return DurandalEnvironment;
});
