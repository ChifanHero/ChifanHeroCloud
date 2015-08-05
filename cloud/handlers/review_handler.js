Parse.Cloud.afterSave('Review', function(request){
	var reviewSaved = request.object;
	var type = reviewSaved.get('type');
	var action = reviewSaved.get('action');
	if (type == undefined) {
		return;
	}
	if (type === 'dish') {
		var dish = reviewSaved.get('dish');
		if (dish != undefined) {
			dish.fetch().then(function(dish){
				if (action == undefined) {
					return;
				}
				if (action === 'like') {
					dish.increment('like_count', 1);
				} else if (action === 'dislike') {
					dish.increment('dislike_count', 1);
				} else if (action === 'neutral') {
					dish.increment('neutral_count');
				}
				dish.save();
			});
		}
	} else if (type === 'restaurant') {
		var restaurant = reviewSaved.get('restaurant');
		if (restaurant != undefined) {
			restaurant.fetch().then(function(restaurant){
				if (action == undefined) {
					return;
				}
				if (action === 'like') {
					restaurant.increment('like_count', 1);
				} else if (action === 'dislike') {
					restaurant.increment('dislike_count', 1);
				} else if (action === 'neutral') {
					restaurant.increment('neutral_count');
				}
				restaurant.save();
			});
		}
	} else if (type === 'list') {
		var list = reviewSaved.get('list');
		if (list != undefined) {
			list.fetch().then(function(list){
				if (action == undefined) {
					return;
				}
				if (action === 'like') {
					list.increment('like_count', 1);
				} 
				list.save();
			});
		}
	}

});

Parse.Cloud.afterDelete('Review', function(request){
	var reviewDeleted = request.object;
	var type = reviewDeleted.get('type');
	var action = reviewDeleted.get('action');
	var object;
	if (type === 'dish') {
		object = reviewDeleted.get('dish');
	} else if (type === 'restaurant') {
		object = reviewDeleted.get('restaurant');
	} else if (type === 'list') {
		object = reviewDeleted.get('list');
	}
	object.fetch().then(function(object){
		if (action === 'like') {
			object.increment('like_count', -1);
		} else if (action === 'dislike') {
			object.increment('dislike_count', -1);
		} else if (action === 'neutral') {
			object.increment('neutral_count', -1);
		}
		object.save(); 
	});
});