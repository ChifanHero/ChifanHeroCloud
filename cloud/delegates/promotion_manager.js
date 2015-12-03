var Promotion = Parse.Object.extend('Promotion');
var _ = require('underscore');
var promotion_assembler = require('cloud/assemblers/promotion');
var error_handler = require('cloud/error_handler');

exports.listAll = function(req, res) {
	// var userLocation = req.body['user_location'];
	var query = new Parse.Query(Promotion);
	query.include('restaurant.picture');
	query.include('dish.from_restaurant');
	query.include('dish.picture');
	query.include('coupon.restaurant.picture');
	query.find().then(function(results) {
		var promotions = [];
		_.each(results, function(result){
			var promotion = promotion_assembler.assemble(result);
			promotions.push(promotion);
		});
		var response = {};
		response['results'] = promotions;
		res.json(200, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	})
}