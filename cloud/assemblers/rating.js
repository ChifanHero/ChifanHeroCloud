var restaurant_assembler = require('cloud/assemblers/restaurant');
var dish_assembler = require('cloud/assemblers/dish');
var list_assembler = require('cloud/assemblers/list');

exports.assemble = function(source){
	var rating = {};
	if (source != undefined) {
		rating['id'] = source.id;
		rating['type'] = source.get('type');
		rating['action'] = source.get('action');
		if (source.get('user') != undefined) {
			var user = {};
			user['id'] = source.get('user').id;
			rating['user'] = user;
		}
		if (source.get('dish') != undefined) {
			var dish = dish_assembler.assemble(source.get('dish'));
			rating['dish'] = dish;
		}
		if (source.get('restaurant') != undefined) {
			var restaurant = restaurant_assembler.assemble(source.get('restaurant'));
			rating['restaurant'] = restaurant;
		}
		if (source.get('list') != undefined) {
			var list = list_assembler.assemble(source.get('list'));
			rating['list'] = list;
		}
	}
	return rating;
}