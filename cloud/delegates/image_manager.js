var _ = require('underscore');
var image_assembler = require('cloud/assemblers/image');
var error_handler = require('cloud/error_handler');

var ImageDatabase = Parse.Object.extend('Image');

// exports.upload = function(req, res){
// 	var base64Code = req.body["base64_code"];
// 	var file = new Parse.File("profile.jpeg", { base64: base64Code });

// 	var image = new ImageDatabase();
// 	image.set("original", file);

// 	image.save().then(function(_image) {
// 		var imageRes = {};
// 		imageRes["result"] = image_assembler.assemble(_image);
// 		res.json(200, imageRes);
// 	}, function(error) {
// 		error_handler.handle(error, {}, res);
// 	});
// }

exports.uploadImage = function(req, res) {
	var restaurantId = req.body["restaurant_id"];
	var type = req.body["type"];
	var base64Code = req.body["base64_code"];
	
	var file = new Parse.File(type + ".jpeg", { base64: base64Code });
	var restaurant = {
	        __type: "Pointer",
	        className: "Restaurant",
	        objectId: restaurantId
	};

	var newImage = new ImageDatabase();
	newImage.set("original", file);
	newImage.set("type", type);
	newImage.set("restaurant", restaurant);
	newImage.save().then(function(newImage) {
		var imageRes = image_assembler.assemble(newImage);
		var response = {};
		response['result'] = imageRes;
		res.json(200, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}