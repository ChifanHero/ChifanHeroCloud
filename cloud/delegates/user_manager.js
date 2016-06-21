var user_assembler = require('cloud/assemblers/user');
var image_assembler = require('cloud/assemblers/image');
var error_handler = require('cloud/error_handler');
var crypto = require('crypto');

var TokenStorage = Parse.Object.extend('TokenStorage');

exports.oauthLogIn = function(req, res){
	var oauthLogin = req.body["oauth_login"];

	var query = new Parse.Query(TokenStorage);
	query.equalTo('oauth_login', oauthLogin);

	query.find().then(function(_tokenStorage) {
		if(_tokenStorage.length == 0){
			var username = oauthLogin + "#ChifanHero";
			//password need to be encoded in the future
			var password = randomValueBase64(12);
			var user = new Parse.User();
			user.set('username', username);
			user.set('password', password);

			user.signUp().then(function(_user){
				var tokenStorage = new TokenStorage();
				tokenStorage.set("oauth_login", oauthLogin);
				tokenStorage.set("username", username);
				tokenStorage.set("password", password);
				tokenStorage.set("session_token", _user.getSessionToken());
				tokenStorage.save();

				var response = {};
				response['success'] = true;
				response['session_token'] = _user.getSessionToken();

				var userRes = user_assembler.assemble(_user);
				response['user'] = userRes;
				res.json(200, response);
			}, function(error){
				error_handler.handle(error, {}, res);
			});
			return;
		} else if(_tokenStorage.length == 1){
			var username = _tokenStorage[0].get("username");
			var password = _tokenStorage[0].get("password");
			var sessionToken = _tokenStorage[0].get("session_token");
			Parse.User.become(sessionToken).then(function(_user){
				var response = {};
				response['success'] = true;
				response['session_token'] = _user.getSessionToken();

				var userRes = user_assembler.assemble(_user);
				response['user'] = userRes;
				res.json(200, response);
			}, function(error){
				if(error["code"] == Parse.Error.INVALID_SESSION_TOKEN){
					Parse.User.logIn(username, password).then(function(_user){
						_tokenStorage[0].set("session_token", _user.getSessionToken());
						_tokenStorage[0].save();
						var response = {};
						response['success'] = true;
						response['session_token'] = _user.getSessionToken();
						var user = user_assembler.assemble(_user);
						response['user'] = user;
						res.json(200, response);
					}, function(error){
						error_handler.handle(error, {}, res);
					});
				} else{
					error_handler.handle(error, {}, res);
				}
			});
			return;
		} else{
			var error = new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, "User with same oauth_login saved multiple times. Please upgrade this issue.");
			error_handler.handle(error, {}, res);
		}
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}

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

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

