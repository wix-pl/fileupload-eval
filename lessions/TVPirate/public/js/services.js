'use strict';

/* Services */
var services = angular.module('tvPirateApp.services', ['ngResource']);

services.factory('Shows', ['$http', '$resource', function($http, $resource){
    return $resource('/show?keyword=:show');
}]);

services.factory('Episodes', ['$http', '$resource', function($http, $resource){
    return $resource('/episodes');
}]);

services.factory('PB', ['$http', '$resource', function($http, $resource){
    return $resource('/pb');
}]);

services.factory('DataService', ['localStorageService', function(localStorageService){
        return {
            getShows : function(){
                return localStorageService.get('shows') || [];
            },
            addShow  : function(show){
                var shows = this.getShows();
                if(!_.find(shows, function(s){ return s.id === show.id; })){
                    shows.push(show);
                    localStorageService.add('shows', angular.toJson(shows));
                }
            },
            removeShow : function(show){
                var shows = this.getShows();
                if(_.find(shows, function(s){ return s.id === show.id; })){
                    localStorageService.add('shows', angular.toJson(_.filter(shows, function(s){ return s.id !== show.id; })));
                }
            }
       };
}]);