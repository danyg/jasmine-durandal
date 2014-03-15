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

To run the tests you need npm in your system (part of nodejs).

- ```git clone https://github.com/danyg/jasmine-durandal.git```
- ```cd jasmine-durandal```
- ```npm install```
- ```npm test```

in this moment a nodewebkit application appears with jasmine for run the tests.

The tests specs are defined on /tests/specs/

Every file that is contained on that folder will be loaded as a spec definition. (May be you need to restart the application to see the additon).

[![Analytics](https://ga-beacon.appspot.com/UA-47717226-1/jasmine-durandal/home)](https://github.com/igrigorik/ga-beacon)
