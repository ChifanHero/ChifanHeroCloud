var BASE_ENDPOINT = 'http://sohungrysearchservice.elasticbeanstalk.com/';
 

function index(type, source){
	if (type !== "restaurant" && type !== "dish" && type !== "list") return;
	if (source === undefined) return;
	var endpoint;
	if (type === "restaurant") {
		endpoint = BASE_ENDPOINT.concat('index/restaurant/single');
	} else if (type === "dish") {
		endpoint = BASE_ENDPOINT.concat('index/dish/single');
	} else if (type === "list") {
		endpoint = BASE_ENDPOINT.concat('index/list/single');
	}
	console.log(endpoint);
	var requestBody = JSON.stringify(source);
	console.log(requestBody);
	return Parse.Cloud.httpRequest({
		method : "POST",
    	url : endpoint,
    	headers:{
    		'Content-Type': 'application/json'
		},
		body : requestBody
		// ,
		// success : function(httpResponse){
		// 	console.log("success");
		// 	console.log(httpResponse.text);
		// },
		// error : function(httpResponse) {
		// 	console.log("error"); 
		// 	console.log(httpResponse.status);
		// 	console.log(httpResponse.text);
		// }
    });
}

function deleteDocument(type, source) {
	if (type !== "restaurant" && type !== "dish" && type !== "list") return;
	if (source === undefined) return;
	var endpoint;
	if (type === "restaurant") {
		endpoint = BASE_ENDPOINT.concat('index/restaurant/single/').concat(source.id);
	} else if (type === "dish") {
		endpoint = BASE_ENDPOINT.concat('index/dish/single/').concat(source.id);
	} else if (type === "list") {
		endpoint = BASE_ENDPOINT.concat('index/list/single/').concat(source.id);
	}
	console.log(endpoint);
	var requestBody = JSON.stringify(source);
	console.log(requestBody);
	Parse.Cloud.httpRequest({
		method : "DELETE",
    	url : endpoint,
    	headers:{
    		'Content-Type': 'application/json'
		},
		success : function(httpResponse){
			console.log("success");
			console.log(httpResponse.text);
		},
		error : function(httpResponse) {
			console.log("error"); 
			console.log(httpResponse.status);
			console.log(httpResponse.text);
		}
    });
}

exports.indexRestaurant = function(restaurant) {
	index("restaurant", restaurant);
}

exports.indexDish = function(dish) {
	index("dish", dish); 
}

exports.indexDishList = function(dishList) {
	index("list", dishList);
}

exports.deleteRestaurant = function(restaurant) {
	deleteDocument("restaurant", restaurant);
}

exports.deleteDish = function(dish) {
	deleteDocument("dish", dish);
}

exports.deleteDishList = function(dishList) {
	deleteDocument("list", dishList);
}

