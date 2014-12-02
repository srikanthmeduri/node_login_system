'use strict';
angular.module('users').config(['$stateProvider',
    function($stateProvider) {

        var checkLoggedOut = function($q, $timeout, $http, $location) {
            var deferred = $q.defer();
            $http.get('/loggedin').success(function(user) {
                if (user !== '0') {
                    $timeout(deferred.reject);
                    $location.url('/login');
                } else $timeout(deferred.resolve);
            });
            return deferred.promise;
        };

        $stateProvider
            .state('home', {
                url: '/'
            })
            .state('auth', {
                url: '/auth',
                templateUrl: 'partials/index.html'
            })
            .state('auth.login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                resolve: {
                    loggedin: checkLoggedOut
                }
            })
            .state('auth.register', {
                url: '/register',
                templateUrl: 'partials/register.html',
                resolve: {
                    loggedin: checkLoggedOut
                }
            })
            .state('forgot-password', {
                url: '/forgot-password',
                templateUrl: 'partials/forgot-password.html',
                resolve: {
                    loggedin: checkLoggedOut
                }
            })
            .state('reset-password', {
                url: '/reset/:tokenId',
                templateUrl: 'partials/reset-password.html',
                resolve: {
                    loggedin: checkLoggedOut
                }
            });
    }
]);
