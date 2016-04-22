var image_assembler = require('cloud/assemblers/image');

exports.assemble = function(source) {
	var restaurantCollection = {};
	if (source != undefined) {
		restaurantCollection['id'] = source.id;
		restaurantCollection['title'] = source.get('title');
		restaurantCollection['description'] = source.get('description');
		restaurantCollection['member_count'] = source.get('member_count');
		restaurantCollection['user_favorite_count'] = source.get('user_favorite_count');
		restaurantCollection['cell_image'] = image_assembler.assemble(source.get('cell_image'));
		restaurantCollection['like_count'] = source.get('like_count');
		restaurantCollection['coverage_radius'] = source.get('coverage_radius');
		var coverageCenterGeo = source.get('coverage_center_geo');
		if (coverageCenterGeo !== undefined) {
			console.log(coverageCenterGeo);
			var coverageCenterGeoRes = {};
			coverageCenterGeoRes['lat'] = coverageCenterGeo.latitude;
			coverageCenterGeoRes['lon'] = coverageCenterGeo.longitude;
			restaurantCollection['coverage_center_geo'] = coverageCenterGeoRes;
		}
	}		
	return restaurantCollection;
}