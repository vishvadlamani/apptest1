'use strict';



app.controller('dashboardController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'auth', function($scope, $rootScope, $http, $state, $stateParams, auth) {
    
    
    var orderState = '';
    $scope.points = [];


    $scope.getOrders = function(status) {
      // Try to login
      $http.get('api/orders?status='+status,  {
        headers: {Authorization: auth.getToken()}
      })
      .then(function(response) {

        var orders = [];
        var totalRevenue = 0;
        var orderDate;
        var orderTImestamp;
        var orderDay;

        var ordersOfDate = [];


        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1).getTime();
        var lastDay = new Date(y, m + 1, 0).getTime();

        angular.forEach(response.data, function(val, key){
          if(!orders[val.status]){
            orders[val.status] = [];
          }
          orders[val.status].push(val);

          totalRevenue = totalRevenue + val.amount;

          orderDate = val.date;

          orderTImestamp = new Date(orderDate).getTime();

          orderDay = new Date(orderDate).getDate();

          if(orderTImestamp >= firstDay && orderTImestamp <= lastDay){
            if(!ordersOfDate[orderDay]){
              ordersOfDate[orderDay] = 0;
            }
            ordersOfDate[orderDay] = ordersOfDate[orderDay] + val.amount;
          }
        });

        for(var i = 0 ; i < ordersOfDate.length ; i++){
          var value = 0;
          if(ordersOfDate[i] == undefined){
            value = 0;
          }
          else{
            value = ordersOfDate[i];
          }
          $scope.points.push([i, value]);
        }
        $scope.points.splice(0, 1);
        
        console.log($scope.points);
        $scope.showChart = true;

        $rootScope.pendingOrdersCount = (orders['Pending']) ? orders['Pending'].length : 0;
        $rootScope.processedOrdersCount = (orders['Processed']) ? orders['Processed'].length : 0;
        $rootScope.paidOrdersCount = (orders['Paid']) ? orders['Paid'].length : 0;
        $rootScope.shippedOrdersCount = (orders['Shipped']) ? orders['Shipped'].length : 0; 

        $rootScope.totalOrdersCount = parseInt($rootScope.pendingOrdersCount + $rootScope.processedOrdersCount + $rootScope.shippedOrdersCount + $rootScope.paidOrdersCount);

        $rootScope.totalRevenue = totalRevenue;
      }, function(x) {
        $scope.authError = 'Server Error';
      });
    };

    $scope.getOrders(orderState);

  }])
;