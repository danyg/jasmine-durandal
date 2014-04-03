/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'./DurandalEnvironment',
	'./viewEngineNotifier',
	'./SpyStub',
	'./_log',
	'durandal/events',
	'durandal/system',
	'plugins/widget',
	'jquery',
	'./widgetLoader'
], function(DurandalEnvironment, viewEngineNotifier, SpyStub, _log, Events, system, widget, $){

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
		this._toRestore = [];

		this._log('INFO', 'WidgetEnvironment creating');

		var me = this,
			l = function(e){
				me._log('ERROR', 'WidgetEnvironment ERROR', e);
			}
		;

		this._denv.on('ERROR')
			.then(l)
			.then(this.proxy('ERROR'))
		;

		viewEngineNotifier.on('missingView_' + this._widgetViewId)
			.then(l)
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
		this._log('INFO', 'WidgetEnvironment newInstance ' + this._widgetId);
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
		this.destroyWidget();
		return this._denv.destroy();
	};

	WidgetEnvironment.prototype.destroyWidget = function(){
		if(!!this._errSubscription){
			this._errSubscription.off();
		}
		if(this._newInstanceSubscription){
			this._newInstanceSubscription.off();
		}
		if(!!this._widgetLoader){
			this._widgetLoader.removeWidget();
		}
	};
	
	WidgetEnvironment.prototype._newInstance = function(defer){
		var me = this;
		if(!!this._errSubscription){
			this._errSubscription.off();
		}
		this._errSubscription = this.on('ERROR', function(err){
			me._log('DEBUG', 'Deferred Reject because a error', err);
			defer.reject(err);
		});
		defer.fail(function(){
			me.destroy();
		});

		this._stub(system, 'error', function(log){
			window.console.error(log);
			me._log('ERROR', 'DURANDAL ERROR', log);
			me.trigger('ERROR', log);
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

		
	WidgetEnvironment.prototype._getSettings = function(){
		var i, copy = {};
		for(i in this._settings){
			if(this._settings.hasOwnProperty(i)){
				copy[i] = this._settings[i];
			}
		}
		return copy;
	};

	WidgetEnvironment.prototype._stub = function(parent, method, code){
		var stub = new SpyStub(parent, method);
		stub.stub(code);
		this._toRestore.push(stub);
	};

	WidgetEnvironment.prototype._restoreStubSpy = function(){
		if(this._toRestore.length > 0){
			var i;
			for(i = 0; i < this._toRestore.length; i++){
				this._toRestore[i].restore();
			}
			this._toRestore = [];
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
				me._restoreStubSpy();
				defer.resolve(widget);
			})
		;
	};
	WidgetEnvironment.prototype._startWidget = function(defer){
		this._listenWidgetLoader(defer);
		this._widgetLoader.setSettings(this._getSettings(), this._myId);
	};

	WidgetEnvironment.prototype._log = function(){
		var args = Array.prototype.splice.call(arguments, 0);
		args.push('[' + this._widgetId + ' with elementId: ' + this._denv._id + ']');
		_log.apply(null, args);
	};
	
	return WidgetEnvironment;
});
