var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var list_assembler = require('cloud/assemblers/list');

exports.assemble = function(source){
	var review = {};
	if (source != undefined) {
		review['id'] = source.id;
		review['type'] = source.get('type');
		review['action'] = source.get('action');
		if (source.get('user') != undefined) {
			var user = {};
			user['id'] = source.get('user').id;
			review['user'] = user;
		}
		if (source.get('dish') != undefined) {
			var dish = dish_assembler.assemble(source.get('dish'));
			review['dish'] = dish;
		}
		if (source.get('restaurant') != undefined) {
			var restaurant = restaurant_assembler.assemble(source.get('restaurant'));
			review['restaurant'] = restaurant;
		}
		if (source.get('list') != undefined) {
			var list = list_assembler.assemble(source.get('list'));
			review['list'] = list;
		}
	}
	return review;
}