/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define(['plugins/router'], function(router){
	
	'use strict';

	var viewmodel = {
		navigationFake: [
			{ route: '', title:'Welcome', moduleId: 'viewmodels/welcome', nav: true, hash: '#', isActive: true },
			{ route: 'flickr', title: 'Flickr', moduleId: 'viewmodels/flickr', nav: true, hash: '#flickr' , isActive: true}
		]
	};

	return viewmodel;
});
