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
	'jquery'
], function(SpyStub, system, app, Events, $){

	'use strict';
	function DurandalEnvironment(moduleId){
		this._originalCompositionComplete = false;
		this._moduleId = moduleId;
		this._id = system.guid();
		this._toRestore = [];

		this.on('ERROR', this.destroy.bind(this));

		this._plugins = {};
		this._listenCompositionComplete();
	}

	Events.includeIn(DurandalEnvironment.prototype);

	DurandalEnvironment.prototype.init = function(){
		var me = this;
		system.debug(true);

		this._stub(system, 'log', function(log){
			if(log.indexOf('Unable to process binding') !== -1){
				me.trigger('ERROR', log);
			}
		});

		return system.defer(function(defer){
			me.on('compositionComplete').then(defer.resolve);
			me.on('ERROR').then(defer.reject);

			me._createRootElement();
			me._startApp();
		}).promise();
	};

	DurandalEnvironment.prototype.configurePlugins = function(plugins){
		this._plugins = plugins;
	};

	DurandalEnvironment.prototype.$ = function(selector){
		return $(selector, this._moduleIdElement);
	};

	DurandalEnvironment.prototype.destroy = function(){
		if(this._toRestore.length > 0){
			var i;
			for(i = 0; i < this._toRestore.length; i++){
				this._toRestore[i].restore();
			}
		}

		$(this._container).remove();
	};

	DurandalEnvironment.prototype._stub = function(parent, method, code){
		var stub = new SpyStub(parent, method);
		if(!!code){
			stub.stub(code);
		}else{
			stub.stub(function(){
				return true;
			});
		}
		this._toRestore.push(stub);
	};

	DurandalEnvironment.prototype._spy = function(parent, method, code){
		var spy = new SpyStub(parent, method);
		if(!!code){
			spy.spy(code);
		}
		this._toRestore.push(spy);
	};

	DurandalEnvironment.prototype._listenCompositionComplete = function(){
		var me = this;
		system.acquire(this._moduleId)
			.done(function(module){
				me._spyCompositionComplete(module);
			})
			.fail(function(err){
				me.trigger('ERROR', new URIError('Module ' + me._moduleId + ' Can\'t be acquired REASON:' + err));
			})
		;
	};

	DurandalEnvironment.prototype._spyCompositionComplete = function(module){
		this._module = module;
		var me = this,
			target = this._module
		;

		if(typeof target === 'function'){
			target = this._module.prototype;
		}

		this._spy(target, 'compositionComplete', function(promise){
			if(!!promise && !!promise.then){
				promise.then(function(){
					me.trigger('compositionComplete');
				});
			}else{
				me.trigger('compositionComplete');
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

		if(window.DEBUG){
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

		app.start().then(function(){
			app.setRoot(me._moduleId, undefined, me._id);
		});
	};

	return DurandalEnvironment;
});
