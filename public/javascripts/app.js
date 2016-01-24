/**
 * Created by yuhwan on 2015. 10. 11..
 */
angular.module('StarterApp', ['ionic', 'starter.controllers', 'starter.services','ngMaterial', 'ngRoute', 'ngAnimate','btford.socket-io'])

.config(function($routeProvider) {

    $routeProvider

        // Collection Page
        .when('/', {
            templateUrl: '../templates/oz-main.html',
            controller: 'ozController'
        });

});