'use strict';



app.controller('ordersController', ['$scope', '$http', '$state', '$stateParams', 'auth', function($scope, $http, $state, $stateParams, auth) {


    $scope.orders = [];
    $scope.orderState = $stateParams.fold;
    $scope.getOrders = function(status) {
      // Try to login
      console.log(auth.getToken());
      $http.get('api/orders?status='+status,  {
        headers: {Authorization: auth.getToken()}
      })
      .then(function(response) {
        $scope.orders = angular.copy(response);
        $scope.showData = true;
      }, function(x) {
        $scope.authError = 'Server Error';
      });
    };

    $scope.getOrders($scope.orderState);


    $scope.changeOrderStatus = function(orderID, currentStatus, newStatus){
      $http.post('api/changeOrderStatus', {orderID: orderID, newStatus: newStatus}, {
        headers: {Authorization: auth.getToken()}
      })
      .then(function(response) {
        if(!response.data.success ){

        }
        else{
          $scope.getOrders(currentStatus);
          
        }
        //$scope.orders = angular.copy(response);
      }, function(x) {
        $scope.authError = 'Server Error';
      });
    }
  }])
;