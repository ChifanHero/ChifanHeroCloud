var image_assembler = require('cloud/assemblers/image');

exports.assemble = function(source, lat, lon) {
	var restaurant = {};
	if (source != undefined) {
		restaurant['id'] = source.id;
		restaurant['name'] = source.get('name');
		restaurant['english_name'] = source.get('english_name');
		restaurant['address'] = source.get('address');
		if (lat != undefined && lon != undefined && source.get('coordinates') != undefined) {
			var destination = new Parse.GeoPoint(lat, lon);
			var distanceValue = source.get('coordinates').milesTo(destination);
			var distance = {};
			if (distanceValue != undefined) {
				distanceValue = distanceValue.toFixed(2);
				distance["value"] = distanceValue;
				distance["unit"] = "mi"
				restaurant['distance'] = distance;
			}
		} 
		
		restaurant['favorite_count'] = source.get('favorite_count');
		restaurant['like_count'] = source.get('like_count');
		restaurant['dislike_count'] = source.get('dislike_count');
		restaurant['neutral_count'] = source.get('neutral_count');
		restaurant['phone'] = source.get('phone');
		restaurant['hours'] = source.get('hours');
		restaurant['picture'] = image_assembler.assemble(source.get('image'));
	}
	return restaurant; 
}