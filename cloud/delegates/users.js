var user_assembler = require('cloud/assemblers/user');
var image_assembler = require('cloud/assemblers/image');
var error_handler = require('cloud/error_handler');

exports.logIn = function(req, res){

	//can't use req.body['username']
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
				error_handler.handle(error, {}, res);
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

	//can't use req.body['username']
	var username = req.body.username;
	var encodedPassword = req.body.password;
	var email = username;

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
	user.signUp().then(function(_user){
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
				error_handler.handle(error, {}, res);
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

	//If session token is invalid, Parse will handle that
	//We don't need to verify session token
	var user = req.user;

	var nickName = req.body['nick_name'];
	var pictureId = req.body['pictureId']

	if(nickName != undefined){
		user.set('nick_name', nickName);
	}
	if(pictureId != undefined){
		var picture = {
	        __type: "Pointer",
	        className: "Image",
	        objectId: pictureId
	    };
		user.set('picture', picture)
	}
	
	user.save().then(function(_user){
		var response = {};
		response['success'] = true;

		var userRes = {};
		userRes = user_assembler.assemble(_user);
		var picture = _user.get('picture');
		if (picture != undefined) {
			picture.fetch().then(function(_picture){
				var pictureRes = image_assembler.assemble(_picture);
				userRes['picture'] = pictureRes;
				response['user'] = userRes;
				res.json(200, response);
			}, function(error){
				error_handler.handle(error, {}, res);
			});
		} else {
			response['user'] = userRes;
			res.json(200, response);
		}
	}, function(error){
		error_handler.handle(error, {}, res);
	}); 
}

exports.logOut = function(req, res){

	//User-Session is required in HTTP header
	Parse.User.logOut().then(function(){
		var response = {};
		response['success'] = true;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});	
}

