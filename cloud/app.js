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
var images = require('cloud/delegates/images');

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

//GET
app.get('/restaurantcollection', restaurant_manager.listAll);
app.get('/restaurant/:id', restaurant_manager.findById);
app.get('/restaurant/:id/menu', menu_manager.findByRestaurantId);


app.get('/messagecollection', message_manager.listAll);
app.get('/message/:id', message_manager.findById);

app.get('/listcollection', list_manager.listAll);
app.get('/list/:id', list_manager.findById);

app.get('/promotioncollection', promotion_manager.listAll);

app.get('/dishcollection', dish_manager.findByRestaurantId);
app.get('/dish/:id', dish_manager.findById);

app.get('/rating', rating_manager.findByUserSession);
app.get('/favorite', favorite_manager.findByUserSession);



//POST
app.post('/user/signUp', user_manager.signUp);
app.post('/user/logIn', user_manager.logIn);
app.post('/user/update', user_manager.update);
app.post('/user/logOut', user_manager.logOut);
app.post('/rating', rating_manager.rate);
app.post('/favorite', favorite_manager.addToFavorite);
app.post('/candidate', candidate_manager.nominate);
app.post('/image', image_manager.upload);
//app.post('/restaurant/:id', restaurant_manager.rate);

//PUT

//DELETE
app.delete('/favorite', favorite_manager.delete); 

app.listen();