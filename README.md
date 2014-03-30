jasmine-durandal
================

A jasmine tool to test durandal modules and widgets, in unitary way

Status: **Beta**

# Beta

## Know Issues
- When you try to test a widget, and the instanciation or activation fails, because an error, the error is not getched, and the jasmine suites freezes.

# Road Map

- Write unit tests for widgets when explodes in the instantiaton even for syntax errors.
- Write unit tests for widgets when explodes because the view.html is no there.
- Write unit tests for SpyStub.
- Write documentation how to 'integrate in your project'.
- Register in bower & npm.
- Create demo repository using bower and / or npm.
- Add this in a fork of durandal starter kit.
- ~~Write unit tests for modules when the viewmodel is a singleton.~~
- ~~Write unit tests for modules when explodes in the instantiaton even for syntax errors.~~
- ~~Write unit tests for modules when explodes because the view.html is no there.~~
- ~~Create a WidgetEnvironmet that extends for DurandalEnvironment and runs a internal module WidgetHolder.~~

# How to use
- Add the distribution file in some place reacheable in your jasmine suite (for the moment only tested on jasmine 1.3.x)
- Add to your paths in requirejs config ```'jasmine-durandal': 'pathToSpecsHelpers/jasmine-durandal-1.3.x```
- before load your specs require ```'jasmine-durandal'```
- if you use jshint or jslint to validate your specs, add in the globals ```describeModule, xdescribeModule, describeWidget, xdescribeWidget, wit, xwit```
- now you can read, in this repository, the file ```/tests/specs/dev/howToUse.spec.js```
 
## tests for module
```javascript
  describeModule('description', 'moduleId', function(){
    var durandal = this.durandal,
      module
    ;
    
    durandal.afterStart(function(){
      module = durandal.getModule(); // the instance of your module
    });
    
    it('description', function(){
      expect(module).toBeDefined();
      expect(durandal.$('nav.nav-bar').length).toBe(1); // durandal.$ will search the selector inside of your module view
    });
  });
```

## tests for widget
```javascript
  describeWidget('description', 'widgetKind', function(){
    var durandal = this.durandal,
      settings = {title: 'a title', color: 'red'}
    ;

    wit('description', settings, function(testee){ // testee will be the instance of your widget,
                                        // in every wit, a new instance of your widget is created
                                        // with the settings received by wit
      expect(testee).toBeDefined();
      expect(durandal.$('.title').length).toBe(1); // durandal.$ will search the selector inside of your widget view
    });
  });
```

# How to run the tests

In order to run the tests you need to have bower and grunt instaled on your system

## to install bower & grunt
- ```npm install -g grunt-cli```
- ```npm install -g bower```

## when bower & grunt, have been installed
- ```git clone https://github.com/danyg/jasmine-durandal.git```
- ```cd jasmine-durandal```
- ```npm install```
- ```grunt tdd```

The tests specs are defined on /tests/specs/dev/*.spec.js

## To create a dist for jasmine 1.3x
- ```grunt build```

## To create a dist for jasmine 2.0
- Coming Soon!

