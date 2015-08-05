var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var list_assembler = require('cloud/assemblers/list');

exports.assemble = function(source){
	var favorite = {};
	if (source != undefined) {
		favorite['id'] = source.id;
		favorite['type'] = source.get('type');
		if (source.get('user') != undefined) {
			var user = {};
			user['id'] = source.get('user').id;
			favorite['user'] = user;
		}
		if (source.get('dish') != undefined) {
			var dish = dish_assembler.assemble(source.get('dish'));
			favorite['dish'] = dish;
		}
		if (source.get('restaurant') != undefined) {
			var restaurant = restaurant_assembler.assemble(source.get('restaurant'));
			favorite['restaurant'] = restaurant;
		}
		if (source.get('list') != undefined) {
			var list = list_assembler.assemble(source.get('list'));
			favorite['list'] = list;
		}
	}
	return favorite;
}