exports.getHomePage = function(req, res) {
	var longitude = parseInt(req.query.lon);
	var latitude = parseInt(req.query.lat);

	var requestOptions = [
		{
			method: 'POST',
			url: 'http://internal.service.lightningorder.com/restaurants',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: {
				request_title: "热门餐厅",
				placement: 0,
				user_location: {
			        lat: latitude,
        			lon: longitude
			    },
			    limit: 8,
			    skip: 0,
			    sort_by: "hotness",
			    sort_order: "descend"
			}
		},
		{
			method: 'POST',
			url: 'http://internal.service.lightningorder.com/restaurants',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: {
				request_title: "离您最近",
				placement: 1,
				user_location: {
			        lat: latitude,
        			lon: longitude
			    },
			    limit: 8,
			    skip: 0,
			    sort_by: "distance",
			    sort_order: "descend"
			}
		}
	];

	var homepageSections = [];
	var responseIndicator = 0;

	for(var index = 0; index < requestOptions.length; index++){
		Parse.Cloud.httpRequest(requestOptions[index]).then(function(httpResponse) {
			// success
			responseIndicator++;
			homepageSections.push(httpResponse.data);
			if(isAllRequestCompleted(responseIndicator, requestOptions.length)){
				var response = {};
				response['homepagesections'] = homepageSections;
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