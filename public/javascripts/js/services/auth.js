app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

    auth.saveToken = function (token){
	  $window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['flapper-news-token'];
	};

	auth.saveUser = function (user){
	  $window.localStorage['current-user'] = JSON.stringify(user);
	};

	auth.getUser = function (){
	  return JSON.parse($window.localStorage['current-user']);
	};

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token && token != 'undefined'){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));
	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.userObj;
	  }
	};

	auth.register = function(user){
	  return $http.post('/api/signup', user).success(function(data){
	    //auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/api/authenticate', user).success(function(data){
	    auth.saveToken(data.token);
	    auth.saveUser(data.user);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('flapper-news-token');
	  
	};


  	return auth;
}])