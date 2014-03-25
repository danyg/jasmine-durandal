/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */
define([
	'src/DurandalEnvironment',
	'durandal/system',
	'durandal/viewLocator',
	'plugins/http',

	'src/jasmine-durandal-1.3x'
], function(DurandalEnvironment, system, viewLocator, http){

	'use strict';

	system.debug(false); // you can change this to debug Durandal and DurandalEnvironment to see what happens there
	
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

	});
});