var _Image = Parse.Object.extend('Image');

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
	var userToSave = request.object;
	if (userToSave.dirty('picture')) {
		var oldUser = new Parse.Query(Parse.User);
		oldUser.equalTo("objectId", userToSave.id);
		oldUser.find().then(function(oldUsers){
			if (oldUsers != undefined && oldUsers.length > 0) {
				var oldUser = oldUsers[0];
				var image = oldUser.get("picture");
				if (image != undefined) {
					var imageId = image.id;
					console.log("image id is ".concat(imageId));
					var image = new _Image();
					image.id = imageId;
					image.destroy().then(function(){ 
						console.log("successfully deleted old image");
						response.success();
					}, function(error){
						response.success();
					});
				} else {
					response.success();
				}
			}
			
		}, function(error) {
			response.reject(error);
		});
	} else {
		response.success();
	}
    
});