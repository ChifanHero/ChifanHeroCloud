var Promotion = Parse.Object.extend('Promotion');
var Restaurant = Parse.Object.extend('Restaurant');
var _ = require('underscore');
var promotion_assembler = require('cloud/assemblers/promotion');
var error_handler = require('cloud/error_handler');
var image_assembler = require('cloud/assemblers/image');
var restaurant_assembler = require('cloud/assemblers/restaurant');


// get promotions from promotions table.
// if less than 10, then get nearby restaurants
exports.listAll = function(req, res) {
	// var userLocation = req.body['user_location'];
	var userLocation = req.body['user_location'];
	var skip = req.body["skip"];
	var limit = req.body["limit"];
	if (limit == undefined) {
		limit = 10;
	}
	var userGeoPoint;
	if (userLocation != undefined && userLocation.lat != undefined && userLocation.lon != undefined) {
		userGeoPoint = new Parse.GeoPoint(userLocation.lat, userLocation.lon);
	}
	var query = new Parse.Query(Promotion);
	query.include('restaurant.image');
	query.include('dish.from_restaurant');
	query.include('dish.image');
	query.include('coupon.restaurant.picture');
	if (userGeoPoint != undefined) {
		query.withinMiles("coordinates", userGeoPoint, 50); 
	}
	query.find().then(function(results) {
		var promotions = [];
		if (results != undefined && results.length > 0) {
			_.each(results, function(result){
				var promotion = promotion_assembler.assemble(result);
				promotions.push(promotion);
			});
		}
		if (promotions.length < limit) {
			var existingIds = [];
			for (var i = 0; i < promotions.length; i++) {
				if (promotions[i].restaurant != null) {
					existingIds.push[promotions[i].restaurant.id];
				}
			}
			var countShort = limit;
			var restaurantQuery = new Parse.Query(Restaurant);
			restaurantQuery.limit(countShort);
			if (userGeoPoint != undefined) {
				restaurantQuery.withinMiles("coordinates", userGeoPoint, 50); 
			}
			restaurantQuery.descending("like_count");
			restaurantQuery.include("image");
			restaurantQuery.find().then(function(restaurants){
				if (restaurants != undefined && restaurants.length > 0) {
					for (var i = 0; i < restaurants.length; i++) { 
						var restaurant = restaurants[i];
						if (_.contains(existingIds, restaurant.id) == false) {
							var promotion = {};
							var lat;
							var lon;
							if (userLocation != undefined) {
								lat = userLocation["lat"];
								lon = userLocation["lon"];
							}
							var rest = restaurant_assembler.assemble(restaurant, lat, lon);
							console.log(restaurant);
							promotion["restaurant"] = rest;
							promotions.push(promotion);
							if (promotions.length == 10) {
								break;
							}
						}
					}
				}
				console.log("before sorting 1");
				console.log("before sort" + promotions);
				var sortedPromotions = _.sortBy(promotions, function(promotion) {
					console.log("sorting");
					if (promotion['restaurant'] != undefined) {
						var rest = promotion['restaurant'];
						if (rest.distance != undefined && rest.distance.value != undefined) {
							console.log("return 1");
							return 0 - rest.distance.value;
						} else {
							console.log("return 0")
							return 0;
						}
					} else {
						return 0;
					}
				}).reverse();
				console.log("after sort" + promotions);
				var response = {};
				response['results'] = sortedPromotions;
				res.json(200, response);
			}, function(error){
				error_handler.handle(error, {}, res);
			});

		} else {
			var response = {};
			console.log("before sorting 2");
			var sortedPromotions = _.sortBy(promotions, function(promotion) {
				if (promotion['restaurant'] != undefined) {
					var rest = promotion['restaurant'];
					if (rest.distance != undefined && rest.distance.value != undefined) {
						return 0 - rest.distance.value;
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			}).reverse();
			response['results'] = sortedPromotions;
			res.json(200, response);
		}
		
	}, function(error) {
		error_handler.handle(error, {}, res);
	})
}