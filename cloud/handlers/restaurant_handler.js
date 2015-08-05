var GOOGLE_API_KEY = 'AIzaSyCRvcRsKxM0WHjJOOMGKnxtFF7CwoYJ7FU';
var GOOGLE_GEOCODING_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json?key='.concat(GOOGLE_API_KEY).concat('&');
 
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
	} else {
		response.success();
	}
}); 

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