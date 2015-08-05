exports.assemble = function(source) {
	var list = {};
	if (source != undefined) {
		list['id'] = source.id;
		list['name'] = source.get('name');
		list['member_count'] = source.get('member_count');
	}		
	return list;
}