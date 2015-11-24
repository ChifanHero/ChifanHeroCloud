var _ = require('underscore');
var image_assembler = require('cloud/assemblers/image');
var error_handler = require('cloud/error_handler');

var ImageDatabase = Parse.Object.extend('Image');

exports.create = function(req, res){
	var base64Code = req.body["base64_code"];
	var file = new Parse.File("profile.jpeg", { base64: base64Code });

	var image = new ImageDatabase();
	image.set("original", file);

	image.save().then(function(_image) {
		var imageRes = {};
		imageRes["result"] = image_assembler.assemble(_image);
		res.json(200, imageRes);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}