var Restaurant = Parse.Object.extend('Restaurant');
var Dish = Parse.Object.extend('Dish');
var DishList = Parse.Object.extend('List');
var indexer = require('cloud/indexer');

Parse.Cloud.job("indexAll", function(request, status) {
  Parse.Cloud.useMasterKey();
  
  // Query for all users
  reindexRestaurant(status);
  reindexDish(status);
  reindexList(status);
});

function reindexRestaurant(status) {
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
  }).then(function() {
    // Set the job's success status
    status.success("Index restaurant successfully.");
  }, function(error) {
    // Set the job's error status
    status.error("Index restaurant failed.");
  });
}

function reindexDish(status) {
  var counter = 0;
  var query = new Parse.Query(Dish);
  query.each(function(dish) {
      // Update to plan value passed in
      if (counter % 100 === 0) {
        // Set the  job's progress status
        status.message(counter + " dishes processed.");
      }
      counter += 1;
      return indexer.indexDish(dish);
  }).then(function() {
    // Set the job's success status
    status.success("Index dish successfully.");
  }, function(error) {
    // Set the job's error status
    status.error("Index dish failed.");
  });
}

function reindexList() {
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
  }).then(function() {
    // Set the job's success status
    status.success("Index list successfully.");
  }, function(error) {
    // Set the job's error status
    status.error("Index list failed.");
  });
}