var express = require('express');
var app = express();

var restaurants = require('cloud/delegates/restaurants');
var promotions = require('cloud/delegates/promotions');
var messages = require('cloud/delegates/messages');
var lists = require('cloud/delegates/lists');
var dishes = require('cloud/delegates/dishes');
var coupons = require('cloud/delegates/coupons');
var users = require('cloud/delegates/users');
var reviews = require('cloud/delegates/reviews');
var favorites = require('cloud/delegates/favorites');
var candidates = require('cloud/delegates/candidates');
var menus = require('cloud/delegates/menus');

app.use(express.bodyParser());  // Populate req.body
app.use(function(req, res, next){
    var sessionToken = req.get("User-Session");
    if(sessionToken === undefined){
        next();
    } else {
        Parse.User.become(sessionToken).then(function(user){
            req.user = user;
            next();
        }, function(error){
            res.status(401);
            var validationError = {};
            validationError.message = error.message;
            validationError.code = error.code;
            res.json(validationError);
        });
    }
      
});

app.get('/restaurants', restaurants.listAll);
app.get('/promotions', promotions.listAll);
app.get('/messages', messages.listAll); 
app.get('/restaurants/:id', restaurants.show);
app.get('/lists', lists.listAll);
app.get('/dishes', dishes.find);
app.get('/dishes/:id', dishes.show);
app.get('/lists/:id', lists.show);
app.get('/messages/:id', messages.show);
app.get('/coupons/draw', coupons.draw);
app.post('/users/signIn', users.signIn);
app.post('/users/signUp', users.signUp);
app.put('/users/:id', users.update);
app.post('/reviews', reviews.create);
app.get('/reviews', reviews.find);
app.post('/favorites', favorites.create);
app.get('/favorites', favorites.find);
app.delete('/favorites', favorites.delete); 
app.post('/candidates', candidates.create);
app.get('/restaurants/:id/menu', menus.find);

app.listen();