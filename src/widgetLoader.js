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

	define(['widgetLoader'], function(){
		return true; // just for advise
	});

}());
