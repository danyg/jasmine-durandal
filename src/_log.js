/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['durandal/system'], function(system){
	'use strict';
	
	/**
	 * 
	 * @param {type} lvl
	 * @param {...} msg
	 * @returns {undefined}
	 */
	function _log(lvl, args){
		if(!system.debug()){
			return;
		}
		lvl = arguments[0].toString().toUpperCase();
		args = Array.prototype.splice.call(arguments, 1);

		if(!!window.navigator.vendor && (window.navigator.vendor.match(/google/i) || window.navigator.vendor.match(/mozilla/i) )){
			var css;
			switch(lvl){
			case 'INFO':
				css = 'background: skyblue; color: black;';
				break;
			case 'WARN':
				css = 'background: orange; color: black;';
				break;
			case 'ERROR':
				css = 'background: red; color: white; font-size: 1.2em;';
				break;
			case 'DEBUG':
				css = 'background: green; color: white';
				break;
			}

			window.console.log('%c' + args.join(' '), css);
		}else{
			window.console.log(lvl + ': ' + args.join(' '));
		}

	}

	return _log;
});
