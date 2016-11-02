var user_assembler = require('cloud/assemblers/user');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('cloud/config.js'));

exports.assemble = function(source) {
	var review = {};
	if (source != undefined) {
		review['id'] = source.id;
		review['content'] = source.get('content');
		review['last_update_time'] = source.updatedAt;
		review['rating'] = source.get('rating');
		review['user'] = user_assembler.assemble(source.get('user'));
		var reviewQuality = source.get('review_quality');
		review['review_quality'] = reviewQuality;
		review['good_review'] = source.get('good_review');
		if (review['user']['id'] != undefined) {
			var pointsRewarded = config['review']['user_points'];
			if (reviewQuality >= config['review']['good_review_threshold']) {
				pointsRewarded = config['review']['good_review_user_points'];
			}
			review['points_rewarded'] = pointsRewarded;
		}

	}
	return review; 
}