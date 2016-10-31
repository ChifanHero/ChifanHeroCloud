var _ = require('underscore');
var Review = Parse.Object.extend('Review');
var UserActivity = Parse.Object.extend('UserActivity');
var error_handler = require('cloud/error_handler');
var Image = Parse.Object.extend('Image');
var Restaurant = Parse.Object.extend('Restaurant');
var review_assembler = require('cloud/assemblers/review');


// request:
// {
// 	"rating" : 5,
// 	"content" : "this is a good restaurant",
// 	"photos" : ["s8gh3ksg2d", "s8gi4hsgs7"],
// 	"id" : "9wigjh2d8u",
//	"restaurant_id" : "7u6y5t4r"
// }
// response:
// {
// 	"id" : "8i7u6y5t4r"
// }
// expected: 1. create a review record; 2. set review id to linked images to create
// a connection; 3. if user_id not undefined, also create a user activity record
// review quality = 不重复字数 * 1 + 图片数 * 10
exports.createReview = function(req, res){
	var user = req.user;
	var rating = req.body['rating'];
	var content = req.body['content'];
	var id = req.body['id'];
	var photos = req.body['photos'];
	var restaurantId = req.body['restaurant_id'];
	var review = new Review();
	if (id !== undefined) {
		review.id = id;
	}
	review.set('content', content);
	review.set('rating', rating);
	review.set('review_quality', calculateQuality(content, photos));
	var restaurant = new Restaurant();
	restaurant.id = restaurantId;
	review.set('restaurant', restaurant);
	var acl = new Parse.ACL();
	acl.setPublicReadAccess(true);
	if (user != undefined) {
		review.set('user', user);
		acl.setWriteAccess(user.id, true);  
	}
	// var objectsToSave = [];
	// objectsToSave.push(review);
	review.setACL(acl);
	review.save().then(function(savedReview){
		var objectsToSave = [];
		if (photos != undefined && _.isArray(photos) && photos.length > 0) {
			_.each(photos, function(photoId){
				var image = new Image();
				image.id = photoId;
				image.set('owner_type', "Review");
				image.set('review', savedReview);
				objectsToSave.push(image);
			});
		}
		if (id == undefined) { // New review, also create a new user activity if necessary
			if (user != undefined) {
				var userActivity = new UserActivity();
				userActivity.set('user', user);
				userActivity.set('type', 'review');
				userActivity.set('review', savedReview);
				objectsToSave.push(userActivity);
			}
		} 
		Parse.Object.saveAll(objectsToSave);
		var response = {};
		response['result'] = review_assembler.assemble(savedReview);
		res.json(201, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});

}

function calculateQuality(content, photos) {
	var quality = 0;
	if (content != undefined) {
		var splitter = ' ';
		if (content.match(/[\u3400-\u9FBF]/)) {
			splitter = '';
		}
		var uniqueList=content.split(splitter).filter(function(allItems,i,a){
		    return i==a.indexOf(allItems);
		});
		quality += uniqueList.length;
	}
	if (photos != undefined) {
		quality += photos.length * 20;
	}
	return quality;
}

exports.listReviews = function(req, res){
	var restaurantId = req.params['restaurant_id'];
	var sort = req.params['sort'];
	var skip = req.params["skip"];
	var limit = req.params["limit"];
	var reviewQuery = new Parse.Query(Review);
	if (sort == 'latest') {
		reviewQuery.descending('updatedAt');
	} else {
		reviewQuery.descending('review_quality');
	}
	reviewQuery.skip(skip);
	reviewQuery.limit(limit);
	reviewQuery.include('user');
	reviewQuery.include('user.picture');
	reviewQuery.find().then(function(_reviews){
		var response = {}; 
		var results = [];
		_.each(_reviews, function(_review){
			var review = review_assembler.assemble(_review);
			results.push(review);
		});

		response['results'] = results;
		res.json(200, response)
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}