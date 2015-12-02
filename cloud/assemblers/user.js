exports.assemble = function(source) {
	var user = {};
	if (source != undefined) {
		user['id'] = source.id;
		user['username'] = source.get('username');
		user['nick_name'] = source.get('nick_name');
		user['email'] = source.get('email');
	}
	return user;
}