var _ = require('underscore');
var Review = Parse.Object.extend('Review');
var Restaurant = Parse.Object.extend('Restaurant');
var Dish = Parse.Object.extend('Dish');
var List = Parse.Object.extend('List');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var review_assembler = require('cloud/assemblers/review');
var error_handler = require('cloud/error_handler');

exports.create = function(req, res){
	var user = req.user;
	if (user == undefined) {
		var error = {};
		error['message'] = 'Please sign in to perform this operation';
		res.json(401, error);
	} else {
		var type = req.body['type'];
		var action = req.body['action'];
		var objectId = req.body['object_id'];
		if (!validateParameters(type, action, res)) {
			return;
		}
		var review = new Review();
		if (type === 'dish') {
			var dish = new Dish();
			dish.id = objectId;
			review.set('type', type);
			review.set('action', action);
			review.set('user', user);
			review.set('dish', dish);
		} else if (type === 'restaurant') {
			var restaurant = new Restaurant();
			restaurant.id = objectId;
			review.set('type', type);
			review.set('action', action);
			review.set('user', user);
			review.set('restaurant', restaurant);
		} else if (type === 'list') {
			var list = new List();
			list.id = objectId;
			review.set('type', type);
			review.set('action', action);
			review.set('user', user);
			review.set('list', list);
		}
		review.save().then(function(_review){
			var rev = review_assembler.assemble(_review);
			var response = {};
			response['result'] = rev;
			res.json(201, response);
		}, function(error){
			error_handler.handle(error, {}, res);
		});
	}
}

function validateParameters(type, action, res) {
	if (type !== 'dish' && type !== 'restaurant' && type !== 'list') {
		var error {};
		error['message'] = 'The parameter \'type\' is invalid';
		res.json(400, error);
		return false;
	}
	if (action !== 'like' && action != 'dislike' && action != 'neutral') {
		error['message'] = 'The parameter \'action\' is invalid';
		res.json(400, error);
		return false;
	}
	return true;
}

exports.find = function(req, res) {
	var action = req.query['action'];
	var type = req.query['type'];
	var user = req.user;
	if (user == undefined) {
		var error {};
		error['message'] = 'Not able to recoginize the user';
		res.json(401, error);
	} else {
		if (!validateParameters(type, action, res)) {
			return;
		}
		var query = new Parse.Query(Review);
		query.equalTo('user', user);
		query.limit(10);
		query.include('dish.from_restaurant');
		query.include('dish.picture');
		query.include('restaurant.picture');
		query.include('list');
		query.equalTo('type', type);
		query.find().then(function(results) {
			if (results != undefined && results.length > 0) {
				var reviews = [];
				_.each(results, function(result) {
					var rev = review_assembler.assemble(result);
					reviews.push(rev);
				});
				var response = {};
				response['results'] = reviews;
				res.json(200, response);
			} else {
				var response = {};
				response['results'] = [];
				res.json(200, response);
			}
		}, function(error) {
			error_handler.handle(error, {}, res);
		});
	}

}