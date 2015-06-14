'use strict';

var app = angular.module('tvPirateApp', [
    'ngRoute',
    'LocalStorageModule',
    'tvPirateApp.services',
    'tvPirateApp.directives',
    'tvPirateApp.controllers'
]);

app.config(function($compileProvider, $routeProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|magnet):/);

    $routeProvider
        .when('/',
        {
            templateUrl: "partials/app.html",
            controller: "SearchCtrl"
        })
        .when('/shows', {
            templateUrl: "partials/shows.html",
            controller: "ShowsCtrl"
        }).otherwise({
            template: "This doesn't exist!"
        })
});