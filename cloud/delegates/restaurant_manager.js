var Restaurant = Parse.Object.extend('Restaurant');
var RestaurantCandidate = Parse.Object.extend('RestaurantCandidate');
var Dish = Parse.Object.extend('Dish');
var _ = require('underscore');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var error_handler = require('cloud/error_handler');
var image_assembler = require('cloud/assemblers/image');

exports.listAll = function(req, res) {
	var userLocation = req.body['user_location'];
	var skip = req.body["skip"];
	var limit = req.body["limit"];
	if (limit == undefined) {
		limit = 10;
	}
	var sortBy = req.body["sort_by"];
	var sortOrder = req.body["sort_order"];
	var requestTitle = req.body["request_title"];
	var placement = req.body["placement"];
	var userGeoPoint;
	if (userLocation != undefined && userLocation.lat != undefined && userLocation.lon != undefined) {
		userGeoPoint = new Parse.GeoPoint(userLocation.lat, userLocation.lon);
	}
	var query = new Parse.Query(Restaurant);
	query.include('image');
	if (userGeoPoint != undefined) {
		query.withinMiles("coordinates", userGeoPoint, 100);
	}
	if (skip != undefined) {
		query.skip(skip);
	}
	if (limit != undefined) {
		query.limit(limit);
	}
	if (sortBy == "hotness") {
		if (sortOrder == "ascend") {
			query.ascending("like_count");
		} else {
			query.descending("like_count");
		}
	} else if (sortBy == "distance" && userGeoPoint != undefined) {
		query.near("coordinates", userGeoPoint);
	}
	query.find().then(function(results) {
		var response = {};
		var restaurants = [];
		var lat;
		var lon;
		if (userLocation != undefined) {
			lat = userLocation["lat"];
			lon = userLocation["lon"];
		}
		_.each(results, function(result){
			var restaurant = restaurant_assembler.assemble(result, lat, lon);
			restaurants.push(restaurant);
		});
		// _.sortBy(restaurants, function(rest) {
		// 	if (rest.distance != undefined && rest.distance.value != undefined) {
		// 		return 0 - rest.distance.value;
		// 	} else {
		// 		return 0;
		// 	}
		// }); 
		response['title'] = requestTitle;
		response['placement'] = placement;
		response['results'] = restaurants;
		res.json(200, response)
	}, function(error) {
		error_handler.handle(error, {}, res);
	})
}

exports.findById = function(req, res) {
	var id = req.params.id;
	var promises = [];
	promises.push(findRestaurantById(id));
	promises.push(findHotDishesByRestaurantId(id));
	Parse.Promise.when(promises).then(function(_restaurant, _dishes){
		var restaurant = restaurant_assembler.assemble(_restaurant);
		var dishes = [];
		if (_dishes != undefined && _dishes.length > 0) {
			_.each(_dishes, function(_dish){
				var dish = dish_assembler.assemble(_dish);
				dishes.push(dish);
			});
		}
		restaurant['hot_dishes'] = dishes;
		if (dishes.length == 0) {
			var candidateQuery = new Parse.Query(RestaurantCandidate);
			candidateQuery.equalTo('restaurant', _restaurant);
			candidateQuery.find(function(candidates){
				var votes = 0;
				if (candidates != undefined && candidates.length > 0) {
					var candidate = candidates[0];
					if (candidate.get('votes') != undefined && candidate.get('votes') > 0) {
						votes = candidate.get('votes');
					}
				}
				restaurant['votes'] = votes;
				var response = {};
				response['result'] = restaurant;
				res.json(200, response);
			}, function(error){
				restaurant['votes'] = 0;
				var response = {};
				response['result'] = restaurant;
				res.json(200, response);
			});
		} else {
			var response = {};
			response['result'] = restaurant;
			res.json(200, response);
		}
		
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}

exports.vote = function(req, res) {
	var id = req.body['restaurant_id'];
	if (id === undefined) {
		var error = {};
		error['message'] = 'Please provide restaurant id';
		res.json(401, error);
		return;
	} else {
		var checkQuery = new Parse.Query(Restaurant);
		checkQuery.get(id).then(function(rest){
			
			var candidateQuery = new Parse.Query(RestaurantCandidate);
			candidateQuery.equalTo('restaurant', rest);
			candidateQuery.find(function(candidates) {
				if (candidates.length == 0) {
					var candidate = new RestaurantCandidate();
					candidate.set('restaurant', rest);
					candidate.set('votes', 1);
					candidate.save().then(function(outcome){
						var response = {};
						var created = {};
						created['id'] = outcome.id;
						created['votes'] = outcome.get('votes');
						response['result'] = created;
						res.json(200, response);
					}, function(error){
						error_handler.handle(error, {}, res);
					});
				} else {
					var existingCandidate = candidates[0];
					existingCandidate.increment("votes");
					existingCandidate.save().then(function(outcome){
						var response = {};
						var created = {};
						created['id'] = outcome.id;
						created['votes'] = outcome.get('votes');
						response['result'] = created;
						res.json(200, response);
					}, function(error) {
						error_handler.handle(error, {}, res);
					});
				}
			}, function(error) {
				error_handler.handle(error, {}, res);
			});
		}, function(){
			var error = {};
			error['message'] = 'restaurant not found';
			res.json(404, error);
		});
	}
}

exports.rate = function(req, res){
	var id = req.params.id;
	var like = 0;
	var dislike = 0;
	var neutral = 0;

	if(req.body['like'] === true){
		like = 1;	
	} else if(req.body['dislike'] === true){
		dislike = 1;	
	} else if(req.body['neutral'] === true){
		neutral = 1;
	}	
	
	var query = new Parse.Query(Restaurant);
	query.get(id).then(function(_restaurant){
		var likeCount = _restaurant.get('like_count');
		var dislikeCount = _restaurant.get('dislike_count');
		var neutralCount = _restaurant.get('neutral_count');
		_restaurant.increment('like_count', like);
		_restaurant.increment('dislike_count', dislike);
		_restaurant.increment('neutral_count', neutral);
		_restaurant.increment('rating_total', like + dislike + neutral);
		_restaurant.save().then(function(_restaurant){
			var restaurantRes = restaurant_assembler.assemble(_restaurant);
			var response = {};
			response['result'] = restaurantRes;
			res.json(200, response);
		}, function(error) {
			error_handler.handle(error, {}, res);
		});
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}

function findRestaurantById(id) {
	var query = new Parse.Query(Restaurant);
	query.include('image');
	return query.get(id);
}

function findHotDishesByRestaurantId(id) {
	var rest = new Restaurant();
	rest.id = id;
	var query = new Parse.Query(Dish);
	query.equalTo('from_restaurant', rest);
	query.include('image');
	query.descending("like_count");
	query.limit(10);
	return query.find();
}

exports.update = function(req, res) {
	var id = req.params.id;
	var restaurant = new Restaurant();
	restaurant.id = id;
	var imageId = req.body["image_id"];
	if(imageId != undefined){
		var picture = {
	        __type: "Pointer",
	        className: "Image",
	        objectId: imageId
	    };
		restaurant.set('image', picture)
	}
	restaurant.save().then(function(_restaurant){
		var restaurant = restaurant_assembler.assemble(_restaurant);
		var image = _restaurant.get('image');
		if (image != undefined) {
			image.fetch().then(function(_image){
				var imageRes = image_assembler.assemble(_image);
				var response = {};
				restaurant['picture'] = imageRes;
				response['result'] = restaurant;
				res.json(200, response);
			}, function(error){
				error_handler.handle(error, {}, res);
			});
		} else {
			var response = {};
			response['result'] = restaurant;
			res.json(200, response);
		}
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}
