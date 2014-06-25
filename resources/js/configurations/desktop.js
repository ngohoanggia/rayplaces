/**
 * Shortcut alias definitions - will come in handy when declaring dependencies
 * Also, they allow you to keep the code free of any knowledge about library
 * locations and versions
 */
requirejs.config({
    baseUrl: "resources/js",
    paths: {
        jquery:'libs/jquery',
        underscore:'libs/underscore',
        text:'libs/text',
        bootstrap: 'libs/bootstrap',
        backbone: 'libs/backbone',
        utilities: 'app/utilities',
        order:'libs/order',
        gmap:'libs/gmap',
        async: 'libs/async',
        router:'app/router/desktop/router'
    },
    // We shim Backbone.js and Underscore.js since they don't declare AMD modules
    shim: {
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },

        'bootstrap': {
            deps: ['jquery']
        },

        'underscore': {
            exports: '_'
        }
    }
});

define("initializer", ["jquery"],
    function ($) {
    // Configure jQuery to append timestamps to requests, to bypass browser caches
    // Important for MSIE
    $.ajaxSetup({cache:false});
    //$('head').append('<link type="text/css" rel="stylesheet" href="resources/css/screen.css"/>');
    $('head').append('<link rel="stylesheet" href="resources/css/bootstrap.css" type="text/css" media="all"/>');
    $('head').append('<link rel="stylesheet" href="resources/css/custom.css" type="text/css" media="all"/>');
    //$('head').append('<link rel="stylesheet" href="resources/css/custom.css" type="text/css" media="all">');
    $('head').append('<link href="http://fonts.googleapis.com/css?family=Rokkitt" rel="stylesheet" type="text/css">');
    //$('head').append('<script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="bootstrap" src="resources/js/libs/bootstrap.js"></script>');
});

// Now we load the dependencies
// This loads and runs the 'initializer' and 'router' modules.
require([
    'order!initializer',
    'order!underscore',
    'order!backbone',
    'order!router',
    'order!bootstrap'
], function(){
});

define("configuration", {
    baseUrl : ""
});