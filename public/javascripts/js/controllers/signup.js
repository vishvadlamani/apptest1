'use strict';

// signup controller
app.controller('SignupFormController', ['$scope', '$http', '$state', 'auth', function($scope, $http, $state, auth) {
    $scope.user = {};
    $scope.authError = null;
    $scope.signup = function() {
      $scope.authError = null;
      // Try to create
      /*$http.post('api/signup', {name: $scope.user.name, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.success ) {
          $scope.authError = response.data.msg;
        }else{
          $state.go('app.dashboard-v1');
        }
      }, function(x) {
        $scope.authError = 'Server Error';
      });*/


      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(response){
        if ( !response.data.success ) {
          $scope.authError = response.data.msg;
        }else{
          $state.go('access.signin');
        }
        
      });
    };
  }])
 ;