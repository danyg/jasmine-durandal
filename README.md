jasmine-durandal
================

A jasmine tool to test durandal modules and widgets, in unitary way

# Road Map
- Write unit tests for modules that the viewmodel is a singleton
- Write unit tests for modules that explodes in the instantiaton even for syntax errors.
- Write unit tests for modules that explodes because the view.html is no there
- Create a WidgetEnvironmet that extends for DurandalEnvironment and runs a internal module WidgetHolder
- Write unit tests for SpyStub
- Write documentation how to 'integrate in your project'
- Add this in the durandal starter kit

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
