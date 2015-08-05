var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var coupon_assembler = require('cloud/assemblers/coupon');

exports.assemble = function(source){
	var promotion = {};
	if (source != undefined) {
		promotion.id = source.id;
		promotion.type = source.get('type');
		if (source.get('restaurant') != undefined) {
			var restaurant = restaurant_assembler.assemble(source.get('restaurant'));
			promotion['restaurant'] = restaurant;
		}
		if (source.get('dish') != undefined) {
			var dish = dish_assembler.assemble(source.get('dish'));
			promotion['dish'] = dish;
		}
		if (source.get('coupon') != undefined) {
			var coupon = coupon_assembler.assemble(source.get('coupon'));
			promotion['coupon'] = coupon;
		}
	}
	return promotion;
}