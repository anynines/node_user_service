# node user service 
Sample showing REST API implementation using mysql db to create users. This service is talking to another service (node_project_service) and is used for training purpose. 

## Run 
* `docker pull mysql`
* `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql`
* create a database called users
* `npm install`
* `npm start`

## Endpoints

### say hello 
`curl -X GET http://localhost:3001/hello`

### create user table
`curl -X POST http://localhost:3001/create_table`

### Create user 
`curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"firstname": "noah", "lastname": "ispas", "age": 28}' http://localhost:3001/user`

### Get all user
`curl -X GET http://localhost:3001/user`

### Get user detail 
`curl -X GET http://localhost:3001/user/<id>`

### Update user 
`curl -H "Accept: application/json" -H "Content-type: application/json" -X PUT -d '{"firstname": "noah", "lastname": "ispas", "age": 18}' http://localhost:3001/user/<id>`

### Delete user 
`curl -X DELETE http://localhost:3001/user/<id>`