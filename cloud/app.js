var express = require('express');
var app = express();

var restaurant_manager = require('cloud/delegates/restaurant_manager');
var promotion_manager = require('cloud/delegates/promotion_manager');
var message_manager = require('cloud/delegates/message_manager');
var list_manager = require('cloud/delegates/list_manager');
var dish_manager = require('cloud/delegates/dish_manager');
var user_manager = require('cloud/delegates/user_manager');
var rating_manager = require('cloud/delegates/rating_manager');
var favorite_manager = require('cloud/delegates/favorite_manager');
var candidate_manager = require('cloud/delegates/candidate_manager');
var menu_manager = require('cloud/delegates/menu_manager');
var image_manager = require('cloud/delegates/image_manager');

//Populate req.body
app.use(express.bodyParser());
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
app.post('/restaurants', restaurant_manager.listAll);
app.get('/restaurants/:id', restaurant_manager.findById);
app.get('/restaurants/:id/menus', menu_manager.findByRestaurantId);


app.get('/messages', message_manager.listAll);
app.get('/messages/:id', message_manager.findById);

app.get('/lists', list_manager.listAll);
app.get('/lists/:id', list_manager.findById);

app.post('/promotions', promotion_manager.listAll);

app.get('/dishes', dish_manager.findByRestaurantId);
app.get('/dishes/:id', dish_manager.findById);

app.get('/ratings', rating_manager.findByUserSession);
app.get('/favorites', favorite_manager.findByUserSession);



//POST
app.post('/users/signUp', user_manager.signUp);
app.post('/users/logIn', user_manager.logIn);
app.post('/users/update', user_manager.update);
app.post('/users/logOut', user_manager.logOut);
app.post('/ratings', rating_manager.rateByUserSession);
app.post('/favorites', favorite_manager.addByUserSession);
app.post('/lists/candidates', candidate_manager.nominate);
app.post('/images', image_manager.upload);
app.post('/restaurantCandidates', restaurant_manager.vote)

//PUT

//DELETE
app.delete('/favorites', favorite_manager.deleteByUserSession); 

app.listen();