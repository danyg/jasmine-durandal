/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['knockout'], function(ko){
	
	function InteractiveWidget(){
		this._thingVisible = ko.observable(true);
	}
	
	InteractiveWidget.prototype.activate = function(settings){
		settings.bindingContext.$this = this;
		
		this._name = settings.name;
	};
	
	InteractiveWidget.prototype._toggleThing = function(){
		this._thingVisible(!this._thingVisible());
	};
	
	return InteractiveWidget;
});