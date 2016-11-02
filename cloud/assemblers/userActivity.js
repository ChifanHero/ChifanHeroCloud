var user_assembler = require('cloud/assemblers/user');
var review_assembler = require('cloud/assemblers/review');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('cloud/config.js'));

exports.assemble = function(source) {
	var activity = {};
	if (source != undefined) {
		activity['id'] = source.id;
		activity['last_update_time'] = source.updatedAt;
		activity['user'] = user_assembler.assemble(source.get('user'));
		activity['type'] = source.get('type');
		activity['review'] = review_assembler.assemble(source.get('review'));
	}
	return activity; 
}