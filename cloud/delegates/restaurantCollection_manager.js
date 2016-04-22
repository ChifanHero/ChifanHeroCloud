var RestaurantCollection = Parse.Object.extend('RestaurantCollection');
var RestaurantCollectionMember = Parse.Object.extend('RestaurantCollectionMember');

var restaurantCollection_assembler = require('cloud/assemblers/restaurantCollection');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var error_handler = require('cloud/error_handler');
var _ = require('underscore');

exports.findById = function(req, res) {
	var id = req.params.id;
	var query = new Parse.Query(RestaurantCollection);
	query.include('cell_image');
	query.get(id).then(function(_restaurantCollection){
		var restaurantCollection = restaurantCollection_assembler.assemble(_restaurantCollection);
		var response = {};
		response['result'] = restaurantCollection;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}

exports.findAllRestaurantsMembersById = function(req, res){
	var id = req.params.id;
	var restaurantCollection = new RestaurantCollection();
	restaurantCollection.id = id;
	var query = new Parse.Query(RestaurantCollectionMember);
	query.include('restaurant');
	query.include('restaurant.image');
	query.equalTo('restaurant_collection', restaurantCollection);
	query.find().then(function(_restaurantCollectionMembers){
		var restaurants = [];
		if (_restaurantCollectionMembers != undefined && _restaurantCollectionMembers.length > 0) {
			_.each(_restaurantCollectionMembers, function(restaurantCollectionMember){
				var restaurant = restaurant_assembler.assemble(restaurantCollectionMember.get('restaurant'));
				restaurants.push(restaurant);
			});
		}
		var response = {};
		response['results'] = restaurants;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}

