exports.assemble = function(source){
	var picture = {};
	if (source != undefined) {
		picture['id'] = source.id;
		if (source.get('thumbnail') != undefined) {
			picture['thumbnail'] = source.get('thumbnail').url();
		}
		if (source.get('original') != undefined) {
			picture['original'] = source.get('original').url();
		}
	}
	return picture;
}