/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

!(function(jasmine){
	'use strict';

	require(['durandal/app'], function(app){
		
		function guid(){
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
		}
		
		function DurandalEnvironment(moduleId){
			this._root = moduleId;
			this._id = guid();
			this._createRootElement();
		}
		
		DurandalEnvironment.prototype._createRootElement = function(){
			this._rootElement = document.createElement('div');
			this._rootElement.id = this._id;
			this._rootElement.style.position = 'absolute';
			this._rootElement.style.left = '-1920px';
			this._rootElement.style.top = '-1080px';
			this._rootElement.style.width = '1920px';
			this._rootElement.style.height = '1080px';
			document.body.appendChild(this._rootElement);
		};
		
		
		window.describeModule = function(moduleId, description, specDefinitions){
			var suite = jasmine.getEnv().describe(description, specDefinitions);
			
			return suite;
		};
		
	});
}(window.jasmine));
