var SelectedCollection = Parse.Object.extend('SelectedCollection');
var RestaurantCollectionMember = Parse.Object.extend('RestaurantCollectionMember');

var selectedCollection_assembler = require('cloud/assemblers/selectedCollection');
var restaurant_assembler = require('cloud/assemblers/restaurant');
var error_handler = require('cloud/error_handler');
var _ = require('underscore');

exports.findById = function(req, res) {
	var id = req.params.id;
	var query = new Parse.Query(SelectedCollection);
	query.include('cell_image');
	query.get(id).then(function(_selectedCollection){
		var selectedCollection = selectedCollection_assembler.assemble(_selectedCollection);
		var response = {};
		response['result'] = selectedCollection;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}

exports.findAllRestaurantsMembersById = function(req, res){
	var id = req.params.id;
	var selectedCollection = new SelectedCollection();
	selectedCollection.id = id;
	var query = new Parse.Query(RestaurantCollectionMember);
	query.include('restaurant');
	query.include('restaurant.image');
	query.equalTo('selected_collection', selectedCollection);
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

