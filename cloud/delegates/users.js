var user_assembler = require('cloud/assemblers/user');
var image_assembler = require('cloud/assemblers/image');
var error_handler = require('cloud/error_handler');

exports.signIn = function(req, res){
	var username = req.body.username;
	var encodedPassword = req.body.password;
	Parse.User.logIn(username, encodedPassword).then(function(_user){
		var response = {};
		response['success'] = true;
		response['session_token'] = _user.getSessionToken();
		var user = user_assembler.assemble(_user);
		var picture = _user.get('picture');
		if (picture != undefined) {
			picture.fetch().then(function(_picture){
				var picture = image_assembler.assemble(_picture);
				user['picture'] = picture;
				response['user'] = user;
				res.json(200, response);
			}, function(error){
				console.log(error);
				response['user'] = user;
				res.json(200, response);
			});
		} else {
			response['user'] = user;
			res.json(200, response);
		}
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}


exports.signUp = function(req, res) {
	var username = req.body.username;
	var encodedPassword = req.body.password;
	var email = req.body.username;

	//username must be provided
	if (username == undefined) {
		var error = {};
		error['message'] = "username must be provided";
		res.json(400, error);
		return;
	}

	//no need to write additional function to validate username. Parse will do that (validate email)

	//password must be provided
	if (encodedPassword == undefined) {
		var error = {};
		error['message'] = "password must be provided";
		res.json(400, error);
		return;
	}

	//since this is encoded password, we can't validate here
	//please validate password on client side


	var user = new Parse.User();
	user.set('username', username);
	user.set('password', encodedPassword);
	user.set('email', email);
	user.signUp(null).then(function(_user){
		var response = {};
		response['success'] = true;
		response['session_token'] = _user.getSessionToken();

		var userRes = user_assembler.assemble(_user);
		var picture = _user.get('picture');

		if (picture != undefined) {
			picture.fetch().then(function(_picture){
				var picture = image_assembler.assemble(_picture);
				userRes['picture'] = picture;
				response['user'] = userRes;
				res.json(200, response);
			}, function(error){
				console.log(error);
				response['user'] = userRes;
				res.json(200, response);
			});
		} else {
			response['user'] = userRes;
			res.json(200, response);
		}
	}, function(error){
		error_handler.handle(error, {}, res);
	});
	
}

exports.update = function(req, res){
	var user = req.user;
	if (user === undefined) {
		var error = {};
		error['message'] = 'Permission required to update user\'s profile';
		res.json(401, error);
		return;
	}
	var nickName = req.body['nick_name'];
	var favoriteCuisine = req.body['favorite_cuisine'];
	user.set('nick_name', nickName);
	user.set('favorite_cuisine', favoriteCuisine);
	user.save().then(function(_user){
		var user = {};
		user['id'] = _user.id;
		user['username'] = _user.get('username');
		user['nick_name'] = _user.get('nick_name');
		user['level'] = _user.get('level');
		var picture = _user.get('picture');
		if (picture != undefined) {
			user['picture'] = picture.url();
		}
		var response = {};
		response['result'] = user;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	}); 
}