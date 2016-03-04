var image_assembler = require('cloud/assemblers/image');

exports.assemble = function(source) {
	var list = {};
	if (source != undefined) {
		list['id'] = source.id;
		list['name'] = source.get('name');
		list['member_count'] = source.get('member_count');
		list['picture'] = image_assembler.assemble(source.get('image'));
	}		
	return list;
}