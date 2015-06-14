'use strict';

/* Directives */
var directives = angular.module('tvPirateApp.directives', []);
directives.directive('episodes', ['Episodes', 'PB', function(Episodes, PB) {
    return {
        restrict: 'E',
        templateUrl: 'partials/episodes.html',
        link: function(scope, elem) {
            scope.getEpisodes = function(show){
                Episodes.get({'show': show.id}, function success(res){
                    var episodes = _.filter(res.Episode, function(episode){
                       return _.has(episode, 'EpisodeName')
                           && episode.SeasonNumber > 0
                           && episode.EpisodeName !== 'TBA';
                    });
                    episodes = _.sortBy(episodes, function(episode){
                        return episode.FirstAired;
                    }).reverse();
                    show.episodes =  _.map(episodes, function(episode){
                        if (_.isObject(episode.FirstAired)){
                            episode.FirstAired = "";
                        } else {
                            var previousweek= new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
                            if(Date.parse(episode.FirstAired) > previousweek.getTime()
                                && Date.parse(episode.FirstAired) < new Date()){
                                episode.new = true;
                            }
                        }
                        episode.SeasonNumber = 'S0'+episode.SeasonNumber;
                        episode.magnet = 'img/loading.gif';
                        episode.SeriesName = show.SeriesName;
                        return episode;
                    });
                });
            }

            scope.getPB = function(episode){
                episode.pbActive = true;
                PB.get({'episode': JSON.stringify(_.pick(episode, 'SeriesName', 'EpisodeName', 'SeasonNumber', 'EpisodeNumber'))},
                    function success(res){
                        if (res && res.results && res.results.length > 0) {
                            episode.pb = res.results[0].magnetlink;
                            episode.magnet = 'img/icon-magnet.gif';
                        } else {
                            episode.pbActive = false;
                        }
                    }
                )
            }

            scope.close = function(show) {
                show.episodes = [];
            }
        }
    }
  }]);
