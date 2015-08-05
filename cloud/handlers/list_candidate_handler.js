var ListMember = Parse.Object.extend('ListMember');
var ListCandidate = Parse.Object.extend('ListCandidate');

Parse.Cloud.beforeSave('ListCandidate', function(request, response){
	var candidate = request.object;
	var dish = candidate.get('dish');
	var list = candidate.get('list');
	var count = candidate.get('count');
	if (dish == undefined || list == undefined) {
		response.error('dish and list must not be undefined');
		return;
	} 
	if (count == undefined) {
		candidate.set('count', 1);
	}
	var tasks = []; 
	tasks.push(findListMember(dish, list));
	if (candidate.dirty('dish') || candidate.dirty('list')) {
		tasks.push(findListCandidate(dish, list));
	}
	Parse.Promise.when(tasks).then(function(members, candidates){
		console.log('inside');
		if (members != undefined && members.length > 0){
			response.error('This dish is already in the list');
			return;
		}
		console.log('candidates: '.concat(candidates));
		if (candidates != undefined && candidates.length >0){
			console.log('found');
			var existingCandidate = candidates[0];
			existingCandidate.increment('count', 1);
			existingCandidate.save();
			response.error('Object exists and not allowed to be redundant');
			return;
		}
		response.success();
	}, function(error){
		response.error(error);
	});
	
});

function findListMember(dish, list){
	var promise = new Parse.Promise();
	var query = new Parse.Query(ListMember);
	query.equalTo('dish', dish);
	query.equalTo('list', list);
	query.find().then(function(members){
		promise.resolve(members);
	}, function(error){
		promise.reject(error);
	});
	return promise;
} 

function findListCandidate(dish, list){
	var promise = new Parse.Promise();
	var query = new Parse.Query(ListCandidate);
	query.equalTo('dish', dish);
	query.equalTo('list', list);
	query.find().then(function(candidates){
		promise.resolve(candidates);
	}, function(error){
		promise.reject(error);
	});
	return promise;
}

Parse.Cloud.afterSave('ListCandidate', function(request){
	var candidate = request.object;
	var count = candidate.get('count');
	if (count > 50) {
		var dish = candidate.get('dish');
		dish.fetch().then(function(dish){
			var score = dish.get('score');
			var list = candidate.get('list');
			var listMember = new ListMember();
			listMember.set('dish', dish);
			listMember.set('list', list);
			listMember.set('score', score);
			listMember.save();
		});
		candidate.destroy();
	}
});