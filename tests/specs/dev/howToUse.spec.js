/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'knockout',
	'durandal/system',
	'durandal/viewLocator',
	'plugins/http',
	
	'widgets/interactive/viewmodel',

	'src/jasmine-durandal-1.3x'
], function(ko, system, viewLocator, http, Interactive){

	'use strict';

//	system.debug(false); // you can change this to debug Durandal and DurandalEnvironment to see what happens there
	
	describe('HOW TO USE', function(){

		describeModule('Welcome Module', 'viewmodels/welcome', function(){
			var durandal = this.durandal,
				module
			;

			durandal.beforeStart(function(){
				viewLocator.useConvention();
			});
			durandal.afterStart(function(){
				module = durandal.getModule();
			});

			describe('Functionality', function(){
				describe('Check equals', function(){ // to show that describe neested works

					it('should display the correct title', function(){
						expect(durandal.$('h2').html()).toEqual(module.displayName);
					});

					it('should display the correct description', function(){
						expect(durandal.$('blockquote').html()).toEqual(module.description);
					});
				});

				it('should display the correct amount of features', function(){
					expect(durandal.$('ul li').length).toBe(module.features.length);
				});
			});
		});

		describeModule('Flickr Module', 'viewmodels/flickr', function(){
			var durandal = this.durandal,
				module
			;

			beforeEach(function(){
				viewLocator.useConvention();
				sinon.stub(http, 'jsonp', function(){
					var dfd = system.defer();
					dfd.resolve(
					{'items':[
						{'title':'Ferry from Poulsbo','link':'http://www.flickr.com/photos/marypcb/13074830034/','media':{'m':'http://farm4.staticflickr.com/3351/13074830034_9747fd3615_m.jpg'},'date_taken':'2013-10-05T17:45:25-08:00','description':' <p><a href=\'http://www.flickr.com/people/marypcb/\'>marypcb</a> posted a photo:</p> <p><a href=\'http://www.flickr.com/photos/marypcb/13074830034/\' title=\'Ferry from Poulsbo\'><img src=\'http://farm4.staticflickr.com/3351/13074830034_9747fd3615_m.jpg\' width=\'240\' height=\'135\' alt=\'Ferry from Poulsbo\' /></a></p> ','published':'2014-03-11T05:41:53Z','author':'nobody@flickr.com (marypcb)','author_id':'81394291@N00','tags':'mountranier lumia lumia1020 vision:sunset=0542 vision:mountain=0819 vision:outdoor=099 vision:clouds=0934 vision:ocean=0888 vision:sky=0985'},
						{'title':'Ferry from Poulsbo','link':'http://www.flickr.com/photos/marypcb/13075953825/','media':{'m':'http://farm4.staticflickr.com/3523/13075953825_a9ae46e254_m.jpg'},'date_taken':'2013-10-05T17:53:56-08:00','description':' <p><a href=\'http://www.flickr.com/people/marypcb/\'>marypcb</a> posted a photo:</p> <p><a href=\'http://www.flickr.com/photos/marypcb/13075953825/\' title=\'Ferry from Poulsbo\'><img src=\'http://farm4.staticflickr.com/3523/13075953825_a9ae46e254_m.jpg\' width=\'240\' height=\'135\' alt=\'Ferry from Poulsbo\' /></a></p> ','published':'2014-03-11T05:41:37Z','author':'nobody@flickr.com (marypcb)','author_id':'81394291@N00','tags':'mountranier lumia lumia1020 vision:mountain=0682 vision:sunset=0645 vision:sky=099 vision:ocean=08 vision:outdoor=0989 vision:clouds=0989'},
						{'title':'Ferry from Poulsbo','link':'http://www.flickr.com/photos/marypcb/13076048133/','media':{'m':'http://farm4.staticflickr.com/3203/13076048133_b2d0d40fbe_m.jpg'},'date_taken':'2013-10-05T17:49:24-08:00','description':' <p><a href=\'http://www.flickr.com/people/marypcb/\'>marypcb</a> posted a photo:</p> <p><a href=\'http://www.flickr.com/photos/marypcb/13076048133/\' title=\'Ferry from Poulsbo\'><img src=\'http://farm4.staticflickr.com/3203/13076048133_b2d0d40fbe_m.jpg\' width=\'240\' height=\'135\' alt=\'Ferry from Poulsbo\' /></a></p> ','published':'2014-03-11T05:41:45Z','author':'nobody@flickr.com (marypcb)','author_id':'81394291@N00','tags':'mountranier lumia lumia1020 vision:mountain=0786 vision:sunset=0643 vision:outdoor=099 vision:sky=099 vision:ocean=0889 vision:clouds=0966'}
					]});
					return dfd.promise();
				});
			});

			afterEach(function(){
				http.jsonp.restore();
			});

			it('should display the correct title', function(){
				module = durandal.getModule();
				expect(durandal.$('h2').html()).toEqual(module.displayName);
			});

			it('should display thumbnails', function(){
				module = durandal.getModule();

				expect(durandal.$('.thumbnails')).toHaveAttr('data-bind');
				expect(durandal.$('.thumbnails').attr('data-bind')).toMatch(/foreach[\s]?:[\s]?images/);
			});

			it('should display the right thumbnails', function(){
				module = durandal.getModule();

				expect(durandal.$('.thumbnails li').length).toBe(3);

				expect(durandal.$('.thumbnails li:nth-child(1) img').attr('src')).toBe(module.images()[0].media.m);
				expect(durandal.$('.thumbnails li:nth-child(2) img').attr('src')).toBe(module.images()[1].media.m);
				expect(durandal.$('.thumbnails li:nth-child(3) img').attr('src')).toBe(module.images()[2].media.m);
			});

		});

		describeWidget('ColorItem widget', 'colorItem', function(){

			var durandal = this.durandal,
				settingsRed = {
					title: 'hello red world',
					color: 'rgb(255, 0, 0)'
				},
				settingsBlue = {
					title: 'hello blue world',
					color: 'rgb(0, 0, 255)'
				}
			;
			
			wit('red color', settingsRed, function(testee){
				// check instance properties
				expect(testee.title).toBe(settingsRed.title);
				expect(testee.color).toBe(settingsRed.color);
				
				// check view bindings
				expect(durandal.$('[data-testid="title"]').text()).toBe(settingsRed.title);
				expect(durandal.$('[data-testid="color"]').css('backgroundColor')).toBe(settingsRed.color);
			});

			wit('blue color', settingsBlue, function(testee){
				// check instance properties
				expect(testee.title).toBe(settingsBlue.title);
				expect(testee.color).toBe(settingsBlue.color);
				
				// check view bindings
				expect(durandal.$('[data-testid="title"]').text()).toBe(settingsBlue.title);
				expect(durandal.$('[data-testid="color"]').css('backgroundColor')).toBe(settingsBlue.color);
			});
			
		});
		
		describeWidget('Interactive Widget', 'interactive', function(){
			var durandal = this.durandal,
				settingsO = {
					name: ko.observable()
				}
			;
			
			beforeEach(function(){
				sinon.spy(Interactive.prototype, '_toggleThing');
			});
			
			afterEach(function(){
				Interactive.prototype._toggleThing.restore();
			});
			
			wit('Static Name', {name: 'the Thing'}, function(testee){
				expect(testee._name).toEqual('the Thing');
				expect(testee._thingVisible()).toBe(true);
				
				expect(durandal.$('[data-testid="nameText"]').text()).toBe(testee._name);
				
				// test button behavior
				expect(testee._toggleThing.called).toBe(false);
				
				durandal.$('[data-testid="toggleButton"]').click();
				
				expect(testee._toggleThing.called).toBe(true);
				expect(testee._thingVisible()).toBe(false);
				
				durandal.$('[data-testid="toggleButton"]').click();
				expect(testee._thingVisible()).toBe(true);
				
			});
			
			wit('Observable Name', settingsO, function(testee){
				expect(testee._name).toBe(settingsO.name);
				expect(testee._thingVisible()).toBe(true);
				
				
				settingsO.name('follow me');
				expect(durandal.$('[data-testid="nameText"]').text()).toBe('follow me');
				
				settingsO.name('on github');
				expect(durandal.$('[data-testid="nameText"]').text()).toBe('on github');
				
				settingsO.name('https://www.github.com/danyg');
				expect(durandal.$('[data-testid="nameText"]').text()).toBe('https://www.github.com/danyg');
				
			});
			
		});

	});
});
