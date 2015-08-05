var restaurant_assembler = require('cloud/assemblers/restaurant');

exports.assemble = function(source) {
	var coupon = {};
	if (source != undefined) {
		coupon['id'] = source.id;
		coupon['content'] = source.get('content');
		coupon['deadline'] = source.get('deadline');
		if (source.get('restaurant') != undefined) {
			var restaurant = restaurant_assembler.assemble(source.get('restaurant'));
			coupon['restaurant'] = restaurant;
		}
	}
	return coupon;
}