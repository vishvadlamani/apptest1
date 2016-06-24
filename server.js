var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var Orders        = require('./app/models/orders'); // get the mongoose model

var sanitizer = require('sanitizer'); // data santize
var port        = process.env.PORT || 8081;
var jwt         = require('jwt-simple');
var path = require('path');
var cookieParser = require('cookie-parser');
var moment = require('moment');
 
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(morgan('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());


/*app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});*/


 
// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  //res.send('Hello! The API is at http://localhost:' + port + '/api');
    res.render('index', { title: "Chirp"});
});
 
// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);


// connect to database
mongoose.connect(config.database);
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please pass email and password.'});
  } else {
    var newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      country: req.body.country,
      phone: req.body.phone,
      password: req.body.password,
      role: 'Normal'
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Email already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});
 
// connect the api routes under /api/*
app.use('/api', apiRoutes);

//var auth = jwt({secret: config.secret});
// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var expires = moment().add('days', 2).valueOf();
          var token = jwt.encode({
           userObj: user,
           exp: expires 
          }, config.secret);

          //var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, user: user, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


apiRoutes.get('/users', passport.authenticate('jwt', { session: false}), function(req, res){
    
  var token = getToken(req.headers);
  if(token && token != 'undefined'){
    var payload = jwt.decode(token, config.secret);
    if(payload.userObj.role == 'Superadmin'){
      User.find({"role" : {$ne : 'Superadmin'}}, function(err, posts){
        if(err){
          return res.send(500, {success: false});
        }
        return res.send(200,posts);
      });    
    }
    else {
      return res.send(403, {success: false, msg: 'Unauthorized'});
    }
  } else {
    return res.send(403, {success: false, msg: 'Unauthorized'});
  }

  
  
});


apiRoutes.post('/changeUserRole', passport.authenticate('jwt', { session: false}), function(req, res){

  var token = getToken(req.headers);
  if(token && token != 'undefined'){
    var payload = jwt.decode(token, config.secret);
    if(payload.userObj.role == 'Superadmin'){

      User.update({
          "_id": req.body.userID
        },
        {
          $set: {
            "role": req.body.newRole
          }
        }, function(err, results){
          if(err){
            return res.send(500, {success: false});
          }
          return res.send(200,{success: true});
        }
      );

    }
    else{
      return res.send(403, {success: false, msg: 'Unauthorized'});
    }
  }
  else{
    return res.send(403, {success: false, msg: 'Unauthorized'});
  }
  
  
});

apiRoutes.post('/updateprofile', passport.authenticate('jwt', { session: false}), function(req, res){



  User.update({
      "_id": req.body._id
    },
    {
      $set: {
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "country": req.body.country,
        "phone": req.body.phone,
        "address": req.body.address,
        "city": req.body.city,
        "zip": req.body.zip
      }
    }, function(err, results){
      if(err){
        return res.send(500, {success: false});
      }
      return res.send(200,{success: true});
    }
  );
  
});


apiRoutes.get('/orders', passport.authenticate('jwt', { session: false}), function(req, res){

   var token = getToken(req.headers);
   var payload = jwt.decode(token, config.secret);    
  if(req.param('status') != ''){
    Orders.find({"status" : req.param('status'),"email":payload.userObj.email}, function(err, posts){
      if(err){
        return res.send(500, err);
      }
      return res.send(200,posts);
    });
  }
  else{
    Orders.find({"email":payload.userObj.email},function(err, posts){
      if(err){
        return res.send(500, err);
      }
      return res.send(200,posts);
    });
  }
});


apiRoutes.post('/changeOrderStatus', passport.authenticate('jwt', { session: false}), function(req, res){
  var token = getToken(req.headers);
  if(token && token != 'undefined'){
    var payload = jwt.decode(token, config.secret);
    if((req.body.newStatus == 'Paid' || req.body.newStatus == 'Shipped' || req.body.newStatus == 'Refund') && payload.userObj.role == 'Normal'){
      return res.send(403, {success: false, msg: 'Unauthorized'});
    }
  }
  else{
    return res.send(403, {success: false, msg: 'Unauthorized'});
  }

  Orders.update({
      "_id": req.body.orderID
    },
    {
      $set: {
        "status": req.body.newStatus
      }
    }, function(err, results){
      if(err){
        return res.send(500, {success: false});
      }
      return res.send(200,{success: true});
    }
  );
  
});


apiRoutes.post('/neworder', function(req, res) {
  
    var newOrder = new Orders({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      cc_number: req.body.cc_number,
      cvv: req.body.cvv,
      exp_month: req.body.exp_month,
      exp_year: req.body.exp_year,
      amount: req.body.amount,
      status: 'Pending',
      date: Date.now()
    });
    // save the user
    newOrder.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Something went wrong while creating order.'});
      }
      res.json({success: true, msg: 'Order has been placed.'});
    });
});

/*apiRoutes.post('/createorder', function(req, res) {
    var newOrder = new Orders({
      firstname: 'Test1',
      lastname: 'Test1',
      email: 'test1@mail.com',
      phone: 9898989898,
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      zip: 32325,
      cc_number: 999999999,
      cvv: 999,
      exp_month: 10,
      exp_year: 2018,
      amount: 200,
      status: 'Pending'
    });
    // save the user
    newOrder.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
});*/
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
