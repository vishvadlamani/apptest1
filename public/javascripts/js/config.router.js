'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams', 'auth', '$window',
      function ($rootScope,   $state,   $stateParams, auth, $window) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;   


          $rootScope.logout = function() {
            auth.logOut();
          }   

          $rootScope.$watch('user', function(){
            if(!$rootScope.user && auth.isLoggedIn()){
              $rootScope.user = auth.getUser();
            }
          })
          
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG', 
      function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
          var layout = "javascripts/views/app.html";
          if(window.location.href.indexOf("material") > 0){
            layout = "javascripts/views/blocks/material.layout.html";
            $urlRouterProvider
              .otherwise('/app/dashboard-v3');
          }else{
            $urlRouterProvider
              .otherwise('/app/dashboard-v1');
          }
          
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: layout,
                  onEnter: ['$state', 'auth', '$timeout', function($state, auth, $timeout){
                    if(!auth.isLoggedIn()){
                      $timeout(function() {
                        $state.go('access.signin', {reload: true});
                      });
                    }
                  }]
              })
              .state('app.dashboard-v1', {
                  url: '/dashboard-v1',
                  templateUrl: 'javascripts/views/app_dashboard_v1.html',
                  controller: 'dashboardController',
                  resolve: load(['javascripts/js/controllers/chart.js'])
              })

              .state('app.profile', {
                  url: '/profile',
                  templateUrl: 'javascripts/views/page_profile.html',
                  controller: 'profileController'
              })
              .state('app.users', {
                  url: '/users',
                  templateUrl: 'javascripts/views/page_users.html',
                  controller: 'usersController',
                  onEnter: ['$state', 'auth', '$timeout', function($state, auth, $timeout){
                    if(auth.isLoggedIn() && auth.getUser().role != 'Superadmin'){
                      $timeout(function() {
                        $state.go('app.dashboard-v1', {reload: true});
                      });
                    }
                  }]
              })
              // pages


              .state('app.sales', {
                  url: '/sales',
                  templateUrl: 'javascripts/views/page_sales.html'              

              })
              .state('app.sales.orders', {
                  url: '/orders/{fold}',
                  templateUrl: 'javascripts/views/page_orders.html',
                  controller: 'ordersController'
              })
              
              // others
        
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              .state('access.signin', {
                  url: '/signin',
                  templateUrl: 'javascripts/views/page_signin.html',
                  resolve: load( ['javascripts/js/controllers/signin.js'] ),
                  onEnter: ['$state', 'auth', '$timeout', function($state, auth, $timeout){
                    if(auth.isLoggedIn()){
                      $timeout(function() {
                        $state.go('app.dashboard-v1');
                      });
                    }
                  }]
              })
              .state('access.signup', {
                  url: '/signup',
                  templateUrl: 'javascripts/views/page_signup.html',
                  resolve: load( ['javascripts/js/controllers/signup.js'] ),
                  onEnter: ['$state', 'auth', '$timeout', function($state, auth, $timeout){
                    if(auth.isLoggedIn()){
                      $timeout(function() {
                        $state.go('app.dashboard-v1');
                      });
                    }
                  }]
              })
              .state('access.404', {
                  url: '/404',
                  templateUrl: 'javascripts/views/page_404.html'
              });

          function load(srcs, callback) {
            return {
                deps: ['$ocLazyLoad', '$q',
                  function( $ocLazyLoad, $q ){
                    var deferred = $q.defer();
                    var promise  = false;
                    srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                    if(!promise){
                      promise = deferred.promise;
                    }
                    angular.forEach(srcs, function(src) {
                      promise = promise.then( function(){
                        if(JQ_CONFIG[src]){
                          return $ocLazyLoad.load(JQ_CONFIG[src]);
                        }
                        angular.forEach(MODULE_CONFIG, function(module) {
                          if( module.name == src){
                            name = module.name;
                          }else{
                            name = src;
                          }
                        });
                        return $ocLazyLoad.load(name);
                      } );
                    });
                    deferred.resolve();
                    return callback ? promise.then(function(){ return callback(); }) : promise;
                }]
            }
          }


      }
    ]
  );
