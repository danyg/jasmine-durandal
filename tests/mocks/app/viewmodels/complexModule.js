/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['knockout'], function(ko){
	
	'use strict';
	
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	function ComplexModule(){
		this.listObjects = ko.observableArray();
		this._setListObjects();
	};
	
	ComplexModule.prototype._setListObjects = function(){
		this.listObjects([
			{title: 'first element', color: 'red'},
			{title: 'second element', color: 'yellow'},
			{title: 'third element', color: 'green'},
			{title: 'fourth element', color: 'blue'}
		]);		
	};
	
	ComplexModule.prototype.addAnItem = function(){
		this.listObjects.push({title: 'fiveth element', color: 'orange'});
	};

	return ComplexModule;
});
