var Restaurant = Parse.Object.extend('Restaurant');
var RestaurantCandidate = Parse.Object.extend('RestaurantCandidate');
var Dish = Parse.Object.extend('Dish');
var _ = require('underscore');
var Coupon = Parse.Object.extend('Coupon');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var error_handler = require('cloud/error_handler');

exports.listAll = function(req, res) {
	var userLocation = req.body['user_location'];
	var skip = req.body["skip"];
	var limit = req.body["limit"];
	if (limit == undefined) {
		limit = 10;
	}
	var sortBy = req.body["sort_by"];
	var sortOrder = req.body["sort_order"];
	var userGeoPoint;
	if (userLocation != undefined && userLocation.lat != undefined && userLocation.lon != undefined) {
		userGeoPoint = new Parse.GeoPoint(userLocation.lat, userLocation.lon);
	}
	var query = new Parse.Query(Restaurant);
	query.include('picture');
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
		_.sortBy(restaurants, function(rest) {
			if (rest.distance != undefined && rest.distance.value != undefined) {
				return 0 - rest.distance.value;
			} else {
				return 0;
			}
		});
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
	promises.push(findCouponByRestaurantId(id));
	Parse.Promise.when(promises).then(function(_restaurant, _dishes, _coupons){
		var restaurant = restaurant_assembler.assemble(_restaurant);
		var dishes = [];
		if (_dishes != undefined && _dishes.length > 0) {
			_.each(_dishes, function(_dish){
				var dish = dish_assembler.assemble(_dish);
				dishes.push(dish);
			});
		}
		restaurant['hot_dishes'] = dishes;
		var coupons = [];
		if (_coupons != undefined && _coupons.length > 0) {
			_.each(_coupons, function(_coupon){
				var coupon = {};
				coupon['id'] = _coupon.id;
				coupons.push(coupon);
			});
		}
		restaurant['coupons'] = coupons;
		var response = {};
		response['result'] = restaurant;
		res.json(200, response);
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
		_restaurant.set('like_count', likeCount + like);
		_restaurant.set('dislike_count', dislikeCount + dislike);
		_restaurant.set('neutral_count', neutralCount + neutral);
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
	query.include('picture');
	return query.get(id);
}

function findHotDishesByRestaurantId(id) {
	var rest = new Restaurant();
	rest.id = id;
	var query = new Parse.Query(Dish);
	query.equalTo('from_restaurant', rest);
	query.include('picture');
	query.limit(10);
	return query.find();
}

function findCouponByRestaurantId(id) {
	var rest = new Restaurant();
	rest.id = id;
	var query = new Parse.Query(Coupon);
	query.equalTo('active', true);
	return query.find();
}