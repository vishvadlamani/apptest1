'use strict';



app.controller('usersController', ['$scope', '$http', '$state', '$stateParams', 'auth', function($scope, $http, $state, $stateParams, auth) {

  $scope.getUsers = function(){
    $http.get('api/users',  {
        headers: {Authorization: auth.getToken()}
      })
      .then(function(response) {
        $scope.users = angular.copy(response);
      }, function(x) {
        $scope.authError = 'Server Error';
      });
  };


  $scope.changeUserRole = function(userID, currentRole, newRole){
      $http.post('api/changeUserRole', {userID: userID, newRole: newRole}, {
        headers: {Authorization: auth.getToken()}
      })
      .then(function(response) {
        if(!response.data.success ){

        }
        else{
          $scope.getUsers();
        }
        //$scope.orders = angular.copy(response);
      }, function(x) {
        $scope.authError = 'Server Error';
      });
    }

  $scope.getUsers();

}])
;