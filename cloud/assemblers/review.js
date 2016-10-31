var user_assembler = require('cloud/assemblers/user');

exports.assemble = function(source) {
	var review = {};
	if (source != undefined) {
		review['id'] = source.id;
		review['content'] = source.get('content');
		review['last_update_time'] = source.updatedAt;
		review['rating'] = source.get('rating');
		review['user'] = user_assembler.assemble(source.get('user'));
		review['review_quality'] = source.get('review_quality');
	}
	return review; 
}