var Coupon = Parse.Object.extend('Coupon');
var coupon_assembler = require('cloud/assemblers/coupon');
var error_handler = require('cloud/error_handler');

exports.show = function(req, res){

}

exports.draw = function(req, res){
	var id = req.query['id'];
	var query = new Parse.Query(Coupon);
	var resp = {};
	query.include('restaurant.picture');
	query.get(id).then(function(_coupon){
		var success = false;
		if (_coupon.get('active') == true && _coupon.get('remaining') > 0) {
			var random = Math.random();
			var probability = _coupon.get('probability');
			if (probability != undefined && probability > 0) {
				if (random < probability) {
					success = true;
				}
			} 
		}
		if (success) {
			resp['user_message'] = '恭喜！';
			var coupon = coupon_assembler.assemble(_coupon);
			resp['coupon'] = coupon;
			_coupon.increment('remaining', -1);
			_coupon.save();
		} else {
			resp['user_message'] = '抱歉，没有抽中，祝下次好运！';
		}
		res.json(200, resp);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}