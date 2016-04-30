# Lightning

## 1. API Reference
### 1. Common
#### API endpoint: http://internal.service.lightningorder.com
#### API headers:
| Key           | Value             | Method                  |
| ------------- | ----------------- | ----------------------- |
| Accept        | application/json  | GET, POST, PUT, DELETE  |
| Content-Type  | application/json  | POST, PUT, DELETE       |

### 2. API URI
#### 1. GET
/restaurants/:id  
/restaurants/:id/menus  
/lists/:id  
/dishes 
/dishes/:id  
/ratings  
/favorites  
/selectedCollection/:id  
/selectedCollectionWithLatAndLon  
/restaurantCollectionMembers/:id

#### 2. POST
/lists  
/restaurants  
/promotions  
/users/signUp  
/users/logIn  
/users/update  
/users/logOut  
/ratings  
/favorites  
/lists/candidates  
/images  
/restaurantCandidates

#### 3. PUT
/restaurants/:id

#### 4. DELETE
/favorites
