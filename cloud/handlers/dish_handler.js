var Review = Parse.Object.extend('Review');
var Favorite = Parse.Object.extend('Favorite');
var indexer = require('cloud/indexer');

Parse.Cloud.afterDelete('Dish', function(request){
	var dishDeleted = request.object;
	deleteRelatedRecords(dishDeleted);
	deleteDishFromIndex(dishDeleted);
	reindexRestaurant(dishDeleted);
});

function deleteRelatedRecords(dishDeleted) {
	if (dish === undefined) {
		return;
	} else {
		var reviewQuery = new Parse.Query(Review);
		var favoriteQuery = new Parse.Query(Favorite);
		reviewQuery.equalTo('dish', dishDeleted);
		favoriteQuery.equalTo('dish', dishDeleted);
		reviewQuery.find().then(function(results){
			Parse.Object.destroyAll(results).then(function(){

			}, function(error){
				console.error('Error deleting reviews. error is ' + error.code + ': ' + error.message);
			});
		});
		favoriteQuery.find().then(function(results){
			Parse.Object.destroyAll(results).then(function(){

			}, function(error){
				console.error('Error deleting favorites. error is ' + error.code + ': ' + error.message);
			});
		});
	}
}

function deleteDishFromIndex(dish) {
	if (dish === undefined) {
		return;
	}
	indexer.deleteDish(dishDeleted);
}

function reindexRestaurant(dish) {
	if (dish === undefined) {
		return;
	}
	var restaurant = dishDeleted.get('from_restaurant');
	if (restaurant !== undefined) {
		restaurant.fetch().then(function(fromRest){
			if (fromRest !== undefined) {
				indexer.indexRestaurant(fromRest);
			}
		}, function(error){
			console.error(error);
		});
	}
}

Parse.Cloud.afterSave('Dish', function(request) {
	var dish = request.object;
	indexer.indexDish(dish);
	reindexRestaurant(dish);

});