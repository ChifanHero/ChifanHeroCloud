var Favorite = Parse.Object.extend('Favorite');

Parse.Cloud.afterSave('Favorite', function(request){
	var favoriteSaved = request.object;
	var type = favoriteSaved.get('type');
	if (type == undefined) {
		return;
	}
	if (type === 'dish') {
		var dish = favoriteSaved.get('dish');
		if (dish != undefined) {
			dish.fetch().then(function(dish){
				dish.increment('favorite_count', 1);
				dish.save();
			});
		}
	} else if (type === 'restaurant') {
		var restaurant = favoriteSaved.get('restaurant');
		if (restaurant != undefined) {
			restaurant.fetch().then(function(restaurant){
				restaurant.increment('favorite_count', 1);
				restaurant.save();
			});
		}
	} else if (type === 'list') {
		var list = favoriteSaved.get('list');
		if (list != undefined) {
			list.fetch().then(function(list){
				list.increment('favorite_count', 1);
				list.save();
			})
		}
	}
});

Parse.Cloud.afterDelete('Favorite', function(request){
	var favoriteDeleted = request.object;
	var type = favoriteDeleted.get('type');
	if (type == undefined) {
		return;
	}
	if (type === 'dish') {
		var dish = favoriteDeleted.get('dish');
		if (dish != undefined) {
			dish.fetch().then(function(dish){
				dish.increment('favorite_count', -1);
				dish.save();
			});
		}
	} else if (type === 'restaurant') {
		var restaurant = favoriteDeleted.get('restaurant');
		if (restaurant != undefined) {
			restaurant.fetch().then(function(restaurant){
				restaurant.increment('favorite_count', -1);
				restaurant.save();
			});
		}
	} else if (type === 'list') {
		var list = favoriteDeleted.get('list');
		if (list != undefined) {
			list.fetch().then(function(list){
				list.increment('favorite_count', -1);
				list.save();
			})
		}
	}
});

Parse.Cloud.beforeSave('Favorite', function(request, response){
	// console.log('before save triggered');
	// Parse.Session.current().then(function(session){
	// 	console.log(session);
	// 	response.success();
	// });
	var favoriteToSave = request.object;
	var user = favoriteToSave.get('user');
	var type = favoriteToSave.get('type');
	if (user == undefined || type == undefined) {
		response.error("incomplete request");
		return;
	}
	var query = new Parse.Query(Favorite);
	query.equalTo('user', user);
	if (type === 'dish') {
		query.equalTo('dish', favoriteToSave.get('dish'));
	} else if (type === 'restaurant') {
		query.equalTo('restaurant', favoriteToSave.get('restaurant'));
	} else if (type === 'list') {
		query.equalTo('list', favoriteToSave.get('list'));
	}
	query.count().then(function(count){
		if (count > 0) {
			response.error('favorite existing');
		} else {
			response.success();
		}
	}, function(error){
		response.error(error);
	});
});