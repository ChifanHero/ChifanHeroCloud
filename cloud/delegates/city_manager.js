var City = Parse.Object.extend('City');
var error_handler = require('cloud/error_handler');
var city_assembler = require('cloud/assemblers/city');
var _ = require('underscore');

exports.findCitiesWithPrefix = function(req, res){
	var prefix = req.query['prefix'];
	var query = new Parse.Query(City);
	query.startsWith('name', prefix);
	query.limit(200);
	query.find().then(function(results) {
		console.log(results.length);
		var cities = [];
		if (results != undefined && results.length > 0) {
			_.each(results, function(result){
				var city = city_assembler.assemble(result);
				cities.push(city);
			});
		}
		var response = {};
		response['results'] = cities;
		res.json(200, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
};