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
			var distance = source.get('coordinates').milesTo(destination);
			distance = distance.concat(' miles');
			restaurant['distance'] = distance;
		} else {
			// TODO: delete me.
			// mock distance for test use.
			restaurant['distance'] = source.get('distance');
		}
		
		restaurant['favorite_count'] = source.get('favorite_count');
		restaurant['like_count'] = source.get('like_count');
		restaurant['dislike_count'] = source.get('dislike_count');
		restaurant['neutral_count'] = source.get('neutral_count');
		restaurant['phone'] = source.get('phone');
		restaurant['hours'] = source.get('hours');
		restaurant['picture'] = image_assembler.assemble(source.get('picture'));
	}
	return restaurant; 
}