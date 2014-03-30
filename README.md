jasmine-durandal
================

A jasmine tool to test durandal modules and widgets, in a unitary way

Status: **Beta**

# Beta

## Know Issues
- When you try to test a widget, and the instanciation or activation fails, because an error, the error is not getched, and the jasmine suites freezes.

# Road Map

- Write unit tests for widgets when explodes in the instantiaton even for syntax errors.
- Write unit tests for SpyStub.
- Write documentation how to 'integrate in your project'.
- Register in bower & npm.
- Create demo repository using bower and / or npm.
- Add this in a fork of durandal starter kit.
- ~~Write unit tests for modules when the viewmodel is a singleton.~~
- ~~Write unit tests for modules when explodes in the instantiaton even for syntax errors.~~
- ~~Write unit tests for modules when explodes because the view.html is no there.~~
- ~~Create a WidgetEnvironmet that extends for DurandalEnvironment and runs a internal module WidgetHolder.~~
- ~~Write unit tests for widgets when explodes because the view.html is no there.~~

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

