requirejs.config({
    paths: {
        'text': '../libs/require/text',
        'durandal':'../libs/durandal/js',
        'plugins' : '../libs/durandal/js/plugins',
        'transitions' : '../libs/durandal/js/transitions',
        'knockout': '../libs/knockout/knockout-2.3.0',
        'bootstrap': '../libs/bootstrap/js/bootstrap',
        'jquery': '../libs/jquery/jquery-1.9.1'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
       }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator'],  function (system, app, viewLocator) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'Durandal Starter Kit';

    app.configurePlugins({
        router:true,
        dialog: true,
        widget: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});