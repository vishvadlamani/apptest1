'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$rootScope', '$http', '$state', 'auth', function($scope, $rootScope, $http, $state, auth) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
      /*$http.post('api/authenticate', {name: $scope.user.name, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.success ) {
          $scope.authError = response.data.msg;
        }else{
          $state.go('app.dashboard-v1');
        }
      }, function(x) {
        $scope.authError = 'Server Error';
      });*/
    

      auth.logIn($scope.user).error(function(error){
        $scope.authError = error;
      }).then(function(response){
        if ( !response.data.success ) {
          $scope.authError = response.data.msg;
        }else{
          $rootScope.user = auth.getUser();
          console.log($rootScope.user);
          $state.go('app.dashboard-v1');
        }
      });

    };
  }])
;