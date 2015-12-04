var _ = require('underscore');
var favorite_assembler = require('cloud/assemblers/favorite');
var error_handler = require('cloud/error_handler');

var Favorite = Parse.Object.extend('Favorite');
var Restaurant = Parse.Object.extend('Restaurant');
var Dish = Parse.Object.extend('Dish');
var List = Parse.Object.extend('List');


exports.addByUserSession = function(req, res){
	var user = req.user;
	var type = req.body['type'];
	var objectId = req.body['object_id'];

	if (user == undefined) {
		var error = {};
		error['message'] = 'User not found';
		res.json(404, error);
		return;
	}

	if (!validateParameters(type)) {
		var error = {};
		error['message'] = 'The parameter \'type\' has invalid value';
		res.json(400, error);
		return;
	}

	var favorite = new Favorite();
	if (type === 'dish') {
		var dish = new Dish();
		dish.id = objectId;
		favorite.set('type', type);
		favorite.set('user', user);
		favorite.set('dish', dish);
	} else if (type === 'restaurant') {
		var restaurant = new Restaurant();
		restaurant.id = objectId;
		favorite.set('type', type);
		favorite.set('user', user);
		favorite.set('restaurant', restaurant);
	} else if (type === 'list') {
		var list = new List();
		list.id = objectId;
		favorite.set('type', type);
		favorite.set('user', user);
		favorite.set('list', list);
	}
	favorite.save().then(function(result){
		var favoriteRes = favorite_assembler.assemble(result);
		var response = {};
		response['result'] = favoriteRes;
		res.json(201, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
	
}

exports.findByUserSession = function(req, res){
	var type = req.query['type'];
	var user = req.user;
	if (user == undefined) {
		var error = {};
		error['message'] = 'User not found';
		res.json(404, error);
		return;
	} 

	if (!validateParameters(type)) {
		var error = {};
		error['message'] = 'The parameter \'type\' has invalid value';
		res.json(400, error);
		return;
	}

	var query = new Parse.Query(Favorite);
	query.equalTo('user', user);
	query.equalTo('type', type);
	query.limit(10);

	query.include('dish.from_restaurant');
	query.include('restaurant');
	query.include('list');

	query.find().then(function(results) {
		var reviews = [];
		if (results != undefined && results.length > 0) {
			_.each(results, function(result) {
				var rev = favorite_assembler.assemble(result);
				reviews.push(rev);
			});
		}
		var response = {};
		response['results'] = reviews;
		res.json(200, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
	
}

exports.deleteByUserSession = function(req, res){
	var user = req.user;
	var type = req.body['type'];
	var objectId = req.body['object_id'];
	var query = new Parse.Query(Favorite);
	query.equalTo('user', user);
	if (type === 'dish') {
		var dish = new Dish();
		dish.id = objectId;
		query.equalTo('dish', dish);
	} else if (type === 'restaurant') {
		var restaurant = new Restaurant();
		restaurant.id = objectId;
		query.equalTo('restaurant', restaurant);
	} else if (type === 'list') {
		var list = new List();
		list.id = objectId;
		query.equalTo('list', list);
	}
	query.find().then(function(results){
		return Parse.Object.destroyAll(results);
	}).then(function(){
		res.json(200, {});
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}



function validateParameters(type) {
	if (type !== 'dish' && type !== 'restaurant' && type !== 'list') {
		return false;
	}
	return true;
}