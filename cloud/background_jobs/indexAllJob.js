var Restaurant = Parse.Object.extend('Restaurant');
var Dish = Parse.Object.extend('Dish');
var DishList = Parse.Object.extend('List');
var indexer = require('cloud/indexer'); 

Parse.Cloud.job("indexAll", function(request, status) {
  Parse.Cloud.useMasterKey();
  var promises = [];
  promises.push(reindexRestaurant(status));
  promises.push(reindexDish(status));
  promises.push(reindexList(status));
  Parse.Promise.when(promises).then(function(){
    status.success("Index objects successfully.");
  }, function() {
    status.error("Index objects failed.");
  });
});

function reindexRestaurant(status) {
  var promise = new Parse.Promise();
  var counter = 0;
  var query = new Parse.Query(Restaurant);
  query.each(function(restaurant) {
      // Update to plan value passed in
      if (counter % 100 === 0) {
        // Set the  job's progress status
        status.message(counter + " restaurants processed.");
      }
      counter += 1;
      return indexer.indexRestaurant(restaurant);
  }).then(function(httpResponse) {
    // Set the job's success status
    status.message("Index restaurant successfully.");
    // console.log(httpResponse.status);
    // console.log(httpResponse.text);
    promise.resolve();
  }, function(httpResponse) {
    // Set the job's error status
    status.message("Index restaurant failed.");
    if (httpResponse !== undefined) {
      console.error("http status is ".concat(httpResponse.status));
    } else {
      console.error("httpResponse is null");
    }
    promise.reject();
  });
  return promise;
}

function reindexDish(status) {
  var promise = new Parse.Promise();
  var counter = 0;
  var query = new Parse.Query(Dish);
  query.each(function(dish) {
      // Update to plan value passed in
      if (counter % 100 === 0) {
        // Set the  job's progress status
        status.message(counter + " dishes processed.");
      }
      counter += 1;
      // console.log(httpResponse.status);
      // console.log(httpResponse.text);
      return indexer.indexDish(dish);
  }).then(function(httpResponse) {
    // Set the job's success status
    status.message("Index dish successfully.");
    promise.resolve();
  }, function(httpResponse) {
    // Set the job's error status
    status.message("Index dish failed.");
    if (httpResponse !== undefined) {
      console.error("http status is ".concat(httpResponse.status));
    } else {
      console.error("httpResponse is null");
    }
    promise.reject();
  });
  return promise;
}

function reindexList(status) {
  var promise = new Parse.Promise();
  var counter = 0;
  var query = new Parse.Query(DishList);
  query.each(function(dishList) {
      // Update to plan value passed in
      if (counter % 100 === 0) {
        // Set the  job's progress status
        status.message(counter + " lists processed.");
      }
      counter += 1;
      return indexer.indexDishList(dishList);
  }).then(function(httpResponse) {
    // Set the job's success status
    // console.log(httpResponse.status);
    // console.log(httpResponse.text);
    status.message("Index list successfully.");
    promise.resolve();
  }, function(httpResponse) {
    // Set the job's error status
    status.message("Index list failed.");
    if (httpResponse !== undefined) {
      console.error("http status is ".concat(httpResponse.status));
    } else {
      console.error("httpResponse is null");
    }
    promise.reject();
  });
  return promise;
}