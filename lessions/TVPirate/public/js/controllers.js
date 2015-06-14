'use strict';

/* Controllers */
angular.module('tvPirateApp.controllers', ['angular-underscore']);
var SearchCtrl = ['$scope', '$location', 'Shows', 'Episodes', 'PB','DataService',
    function($scope, $location, Shows, Episodes, PB, DataService) {
        $scope.init = function(){
            $scope.shows = DataService.getShows().length > 0;
        }

        $scope.search = function(){
            $scope.clear();
            Shows.get({'show': $scope.keyword}, function success(res){
                if(_.isArray(res.Series)){
                    $scope.Series = res.Series;
                } else {
                    $scope.Series = [];
                    $scope.Series.push(res.Series);
                }

            });
        }

        $scope.addShow = function(show){
            DataService.addShow(show);
             $location.path('/shows');
        }

        $scope.clear = function(){
            $scope.Episodes = [];
            $scope.Series = [];
        }

        $scope.gotToShows = function(show){
             $location.path('/shows');
        }
    }
];

var ShowsCtrl = ['$scope', '$location', 'Shows', 'Episodes', 'PB', 'DataService',
    function($scope, $location, Shows, Episodes, PB, DataService) {
        $scope.Series = DataService.getShows();
        _.each($scope.Series, function(show){
           Episodes.get({'show': show.id}, function success(res){
               var episodes = _.filter(res.Episode, function(episode){
                   return _.has(episode, 'EpisodeName')
                       && episode.SeasonNumber > 0
                       && episode.EpisodeName !== 'TBA';
               });
               var previousweek= new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
               _.each(episodes, function(episode){
                   if(Date.parse(episode.FirstAired) > previousweek.getTime()
                       && Date.parse(episode.FirstAired) < new Date()){
                       show.hasNew = true;
                       return;
                   }
               });
           });
        });

        $scope.removeShow = function(show){
             DataService.removeShow(show);
            $scope.Series = DataService.getShows();
        }

        $scope.home = function(){
            $location.path('/');
        }
    }
];