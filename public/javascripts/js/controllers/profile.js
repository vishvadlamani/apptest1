'use strict';



app.controller('profileController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'auth', function($scope, $rootScope, $http, $state, $stateParams, auth) {
    
        var user = auth.getUser(); 

        $scope.user = angular.copy(user);

        $scope.updateprofile = function(){
         

          $http.post('api/updateprofile', $scope.user, {
            headers: {Authorization: auth.getToken()}
          })
          .then(function(response) {
            if(!response.data.success ){

            }
            else{
              auth.saveUser($scope.user);
              $rootScope.user = auth.getUser();

              console.log('Updated');
            }
            //$scope.orders = angular.copy(response);
          }, function(x) {
            $scope.authError = 'Server Error';
          });
        }

  }])
;