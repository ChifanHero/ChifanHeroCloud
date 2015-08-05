var Restaurant = Parse.Object.extend('Restaurant');
var Dish = Parse.Object.extend('Dish');
var _ = require('underscore');
var Coupon = Parse.Object.extend('Coupon');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var error_handler = require('cloud/error_handler');

exports.listAll = function(req, res) {
	var query = new Parse.Query(Restaurant);
	query.include('picture');
	query.find().then(function(results) {
		var response = {};
		var restaurants = [];
		_.each(results, function(result){
			var restaurant = restaurant_assembler.assemble(result);
			restaurants.push(restaurant);
		});
		response['results'] = restaurants;
		res.json(200, response)
	}, function(error) {
		error_handler.handle(error, {}, res);
	})
}

exports.show = function(req, res) {
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