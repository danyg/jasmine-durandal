/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'./DurandalEnvironment',
	'./viewEngineNotifier',
	'durandal/events',
	'durandal/system',
	'plugins/widget',
	'jquery',
	'./widgetLoader'
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