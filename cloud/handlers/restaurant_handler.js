var GOOGLE_API_KEY = 'AIzaSyCRvcRsKxM0WHjJOOMGKnxtFF7CwoYJ7FU';
var GOOGLE_GEOCODING_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json?key='.concat(GOOGLE_API_KEY).concat('&');
var Review = Parse.Object.extend('Review');
var Favorite = Parse.Object.extend('Favorite');
var Dish = Parse.Object.extend('Dish');
var Menu = Parse.Object.extend('MenuItem');
var Restaurant = Parse.Object.extend('Restaurant');
var _Image = Parse.Object.extend('Image');

Parse.Cloud.beforeSave('Restaurant', function(request, response){
	var restaurantToSave = request.object;
	if (restaurantToSave.dirty('address')) {
		var address = restaurantToSave.get('address');
		getCoordinatesFromAddress(address).then(function(lat, lon){	
			console.log(lat);
			console.log(lon);
			var coordinates = new Parse.GeoPoint({latitude : lat, longitude : lon});
			restaurantToSave.set('coordinates', coordinates);
			response.success();
		}, function(error){
			console.log(error);
			response.success();
		});
	} else if (restaurantToSave.dirty('image')) {
		var oldRestaurant = new Restaurant();
		oldRestaurant.set("objectId", restaurantToSave.id);
		oldRestaurant.fetch().then(function(oldRestaurant){
			var image = oldRestaurant.get("image");
			if (image != undefined) {
				var imageId = image.id;
				console.log("image id is ".concat(imageId));
				var image = new _Image();
				image.id = imageId;
				image.destroy().then(function(){ 
					console.log("successfully deleted old image");
					response.success();
				}, function(error){
					response.success(); 
				});
			} else {
				response.success();
			}
		}, function(error) {
			response.error(error);
		});
	} else {
		response.success();
	}
}); 


Parse.Cloud.afterDelete('Restaurant', function(request) {
 	var restaurant = request.object;
 	deleteRelatedRecords(restaurant);	
});


function deleteRelatedRecords(restaurant) {
	if (restaurant === undefined) {
		return;
	}
	var reviewQuery = new Parse.Query(Review);
	var favoriteQuery = new Parse.Query(Favorite);
	var dishQuery = new Parse.Query(Dish);
	var menuQuery = new Parse.Query(Menu);
	reviewQuery.equalTo('restaurant', restaurant);
	favoriteQuery.equalTo('restaurant', restaurant);
	dishQuery.equalTo('from_restaurant', restaurant);
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
	dishQuery.find().then(function(results){
		Parse.Object.destroyAll(results).then(function(){

		}, function(error){
			console.error('Error deleting dishes. error is ' + error.code + ': ' + error.message);
		});
	});
	menuQuery.find().then(function(results){
		Parse.Object.destroyAll(results).then(function(){

		}, function(error){
			console.error('Error deleting menu. error is ' + error.code + ': ' + error.message);
		});
	});
}


function getCoordinatesFromAddress(address) {
	var promise = new Parse.Promise();
	if (address != undefined) {
		address = encodeURIComponent(address);
    	var url = GOOGLE_GEOCODING_ENDPOINT.concat('address=').concat(address);
    	Parse.Cloud.httpRequest({
    		url : url,
    		success : function(httpResponse){
    			var data = httpResponse.data;
    			if(data.status === 'OK' && data.results !== undefined 
                                        && data.results.length > 0 && data.results[0].geometry !== undefined 
                                        && data.results[0].geometry.location !== undefined){
	                var location = data.results[0].geometry.location;
	                promise.resolve(location.lat, location.lng);
	            } else {
	            	console.log(data);
	                promise.reject('unable to get restaurant address from google geocoding');
	            }
    		}
    	});
	} else {
		promise.reject('restaurant address undefined');
	}
	return promise;
}