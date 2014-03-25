/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define([], function(){
	'use strict';
	
	function ColorItem(){
	}
	
	ColorItem.prototype.activate = function(settings){
		this._settings = settings;
		this.color = this._settings.color;
		this.title = this._settings.title;
	};
	
	return ColorItem;
	
});
