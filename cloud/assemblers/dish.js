var restaurant = require('cloud/assemblers/restaurant');
var image_assembler = require('cloud/assemblers/image');

exports.assemble = function(source) {
	var dish = {};
	if (source != undefined) {
		dish['id'] = source.id;
		dish['name'] = source.get('name');
		dish['english_name'] = source.get('english_name');
		dish['favorite_count'] = source.get('favorite_count');
		dish['like_count'] = source.get('like_count');
		dish['dislike_count'] = source.get('dislike_count');
		dish['neutral_count'] = source.get('neutral_count');
		dish['picture'] = image_assembler.assemble(source.get('picture'));
		var restaurant = {};
		if (source.get('from_restaurant') != undefined) {
			var rest = source.get('from_restaurant');
			restaurant['id'] = rest.id;
			restaurant['name'] = rest.get('name');
			restaurant['english_name'] = rest.get('english_name');
		}
		dish['from_restaurant'] = restaurant;
	}
	return dish;
}