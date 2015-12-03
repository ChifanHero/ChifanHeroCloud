var Dish = Parse.Object.extend('Dish');
var Restaurant = Parse.Object.extend('Restaurant');
var List = Parse.Object.extend('List');
var ListCandidate = Parse.Object.extend('ListCandidate');
var candidate_assembler = require('cloud/assemblers/candidate');
var error_handler = require('cloud/error_handler');

exports.nominate = function(req, res){
	var dishId = req.body['dish_id'];
	var listId = req.body['list_id'];
	if (dishId == undefined || listId == undefined) {
		res.json(401, 'invalid parameters');
		return;
	}
	var dish = new Dish();
	dish.id = dishId;
	var list = new List();
	list.id = listId;
	var candidate = new ListCandidate();
	candidate.set('dish', dish);
	candidate.set('list', list);
	candidate.save().then(function(_candidate){
		var candidate = candidate_assembler.assemble(_candidate);
		res.json(201, candidate);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}