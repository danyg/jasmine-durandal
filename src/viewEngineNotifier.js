/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

define([
	'./SpyStub',
	'./_log',
	'durandal/events', 
	'durandal/viewEngine',
	'durandal/system'
], function(SpyStub, _log, Events, viewEngine, system){
	var viewEngineNotifier = {
		createFallbackViewStub: null,
		_setUp: function(){
			var me = this;
			this.createFallbackViewStub = new SpyStub(viewEngine, 'createFallbackView');

			this.createFallbackViewStub.stub(function(viewId, requirePath, err){
				return system.defer(function(defer){
					var message = 'View Not Found. Searched for "' + viewId + '" via path "' + requirePath + '".';
					_log('ERROR', message, '[' + viewId + ']');
					me.trigger('missingView_' + viewId, message);
					defer.reject(message);
					throw err;
				}).promise();
			});
		}
	};
	
	Events.includeIn(viewEngineNotifier);
	viewEngineNotifier._setUp();
	
	return viewEngineNotifier;
});
