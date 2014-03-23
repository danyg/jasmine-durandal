/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

define([], function(){

	'use strict';

	function SpyStub(parent, method){
		this._parent = parent;
		this._method = method;
		this._original = false;

		if(!!this._parent[this._method]){
			this._original = this._parent[this._method];
		}
	}

	SpyStub.prototype.stub = function(code){
		if(!code){
			code = function(){
				return true;
			};
		}
		this._parent[this._method] = code;
	};

	SpyStub.prototype.spy = function(code){
		var me = this;
		
		if(typeof code !== 'function'){
			throw new TypeError('code must be a function');
		}
		
		if(this._original !== false){
			this._parent[this._method] = function(){
				var retvalue = me._original.apply(this, arguments);
				code(retvalue);
				return retvalue;
			};
		}else{
			this._parent[this._method] = function(){
				code();
			};
		}
	};

	SpyStub.prototype.restore = function(){
		if(this._original !== false){
			this._parent[this._method] = this._original;
		}else{
			delete this._parent[this._method];
		}
	};

	return SpyStub;
});