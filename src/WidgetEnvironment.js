/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define(['./widgetLoader'], function(){
	'use strict';
	
	function WidgetEnvironment(moduleId){
		this._moduleId = moduleId;
	}
	
	return WidgetEnvironment;
});