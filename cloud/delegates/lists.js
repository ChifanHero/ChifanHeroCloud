var List = Parse.Object.extend('List');
var _ = require('underscore');
var ListMember = Parse.Object.extend('ListMember');
var list_assembler = require('cloud/assemblers/list');
var error_handler = require('cloud/error_handler');

exports.listAll = function(req, res) {
	var query = new Parse.Query(List);
	query.find().then(function(results) {
		var lists = [];
		if(results != undefined && results.length > 0) {
			_.each(results, function(result) {
				var l = list_assembler.assemble(result);
				lists.push(l);
			});
		}
		var response = {};
		response['results'] = lists;
		res.json(200, response);
	}, function(error) {
		error_handler.handle(error, {}, res);
	});
}

exports.show = function(req, res) {
	var id = req.params.id;
	var promises = [];
	promises.push(getListById(id));
	promises.push(getListMembersByListId(id));
	Parse.Promise.when(promises).then(function(_list, _dishes){
		var list = {};
		if (_list != undefined) {
			list['id'] = _list.id;
			list['name'] = _list.get('name');
			list['member_count'] = _list.get('member_count');
			list['favorite_count'] = _list.get('favorite_count');
			list['like_count'] = _list.get('like_count');
			var dishes = [];
			if (_dishes != undefined && _dishes.length > 0) {
				_.each(_dishes, function(_dish){
					var dish = {};
					dish['id'] = _dish.id;
					dish['name'] = _dish.get('name');
					dish['english_name'] = _dish.get('english_name');
					dish['favorite_count'] = _dish.get('favorite_count');
					dish['like_count'] = _dish.get('like_count');
					dish['dislike_count'] = _dish.get('dislike_count');
					dish['neutral_count'] = _dish.get('neutral_count');
					var restaurant = {};
					if (_dish.get('from_restaurant') != undefined) {
						var _rest = _dish.get('from_restaurant');
						restaurant['id'] = _rest.id;
						restaurant['name'] = _rest.get('name');
						restaurant['english_name'] = _rest.get('english_name');
					}
					dish['from_restaurant'] = restaurant;
					dishes.push(dish);
				});
			}
			list['dishes'] = dishes;
		}
		var response = {};
		response['result'] = list;
		res.json(200, response);
	}, function(error){
		error_handler.handle(error, {}, res);
	});
}

function getListById(id) {
	var query = new Parse.Query(List);
	return query.get(id);
}

function getListMembersByListId(id) {
	var promise = new Parse.Promise();
	var list = new List();
	list.id = id;
	var query = new Parse.Query(ListMember);
	query.equalTo('list', list);
	query.include('dish.from_restaurant');
	query.limit(10);
	query.find().then(function(_members){
		var dishes = [];
		if(_members != undefined && _members.length > 0){
			_.each(_members, function(member){
				dishes.push(member.get('dish'));
			});
		}
		promise.resolve(dishes);
	}, function(error){
		promise.reject(error);
	});
	return promise;
}