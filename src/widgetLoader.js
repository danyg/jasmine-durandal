/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

(function(){
	'use strict';
	
	define('widgetLoader', ['knockout'], function(ko){

		var widgetLoader = {
			_widgetSettings: ko.observable(),

			setSettings: function(settings){
				this._widgetSettings(settings);
			}
		};

		return widgetLoader;
	});

	define('text!widgetLoader.htmlf', function(){

		return '<div id="widgetLoader">' +
			'<!-- ko if: !!_widgetSettings() -->' +
				'<div id="widgetContainer" data-bind="widget: _widgetSettings">' +
				'</div>' +
			'<!-- /ko -->' +
		'</div>';
	});
	
}());
