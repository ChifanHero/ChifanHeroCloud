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
	var userGeoPoint;
	if (userLocation != undefined && userLocation.lat != undefined && userLocation.lon != undefined) {
		userGeoPoint = new Parse.GeoPoint(userLocation.lat, userLocation.lon);
	}
	var query = new Parse.Query(Promotion);
	query.include('restaurant.picture');
	query.include('dish.from_restaurant');
	query.include('dish.picture');
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
		if (promotions.length < 10) {
			var existingIds = [];
			for (var i = 0; i < promotions.length; i++) {
				if (promotions[i].restaurant != null) {
					existingIds.push[promotions[i].restaurant.id];
				}
			}
			var countShort = 10;
			var restaurantQuery = new Parse.Query(Restaurant);
			restaurantQuery.limit(countShort);
			if (userGeoPoint != undefined) {
				restaurantQuery.withinMiles("coordinates", userGeoPoint, 50); 
			}
			restaurantQuery.descending("like_count");
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
							promotion["restaurant"] = rest;
							promotions.push(promotion);
							if (promotions.length == 10) {
								break;
							}
						}
					}
				}
				var response = {};
				response['results'] = promotions;
				res.json(200, response);
			}, function(error){
				error_handler.handle(error, {}, res);
			});

		} else {
			var response = {};
			response['results'] = promotions;
			res.json(200, response);
		}
		
	}, function(error) {
		error_handler.handle(error, {}, res);
	})
}