/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

requirejs.config({
	paths: {
		'durandal': 'empty:',
		'transitions': 'empty:',
		'plugins': 'empty:',
		'knockout': 'empty:',
		'jquery': 'empty:',
		'text': 'empty:'
	},
	useStrict: true,
	stubModules: ['text'],
	optimize: 'none'
});
