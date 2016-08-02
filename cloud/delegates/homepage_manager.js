exports.getHomePage = function(req, res) {
	var requestOptions = [
		{
			method: 'POST',
			url: 'http://internal.service.lightningorder.com/restaurants',
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				user_location: {
			        lat: 37.3081,
        			lon: -121.9942
			    },
			    limit: 2,
			    skip: 0
			}
		},
		{
			method: 'POST',
			url: 'http://internal.service.lightningorder.com/restaurants',
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				user_location: {
			        lat: 37.3081,
        			lon: -121.9942
			    },
			    limit: 2,
			    skip: 0
			}
		}
	];

	var results = [];
	var responseIndicator = 0;

	for(var index = 0; index < requestOptions.length; index++){
		Parse.Cloud.httpRequest(requestOptions[index]).then(function(httpResponse) {
			// success
			responseIndicator++;
			results.push(httpResponse.data);
			if(isAllRequestCompleted(responseIndicator, requestOptions.length)){
				var response = {};
				response['results'] = results;
				res.json(200, response)
			}
		},function(httpResponse) {
			// error
			console.error('Request failed with response code ' + httpResponse.status);
		});
	}
}

var isAllRequestCompleted = function(currentCount, totalCount){
	if(currentCount < totalCount){
		return false;
	} else {
		return true;
	}
}