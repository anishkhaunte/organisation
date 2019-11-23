# organisation


## Installation guide:
* Install node (for npm)
* Install postgres
* Create two db named ```postgres``` and another ```test``` running on port ```5432``` with ```username: postgres``` & ```password: admin```
* Install docker



## Running the tests
- ```npm test```



## Running the application
1. ```docker-compose build```
2. ```docker-compose up```


###### Endpoints can be accessed via 

1. ```localhost:5000/api/organization to create an organization (POST) ```
2. ```localhost:5000/api/organization?offset=0&organization_name=<value> (GET)```


###### Overview 
* Ajv validator to validate the inputs
* ```deployment.json``` which overides environment specific configuration when needed
* The endpoints are defined in the rest files and the service layer code is served by the files in services folder
* The GET organisation response has moreAvailable property which tells us whether more paginated items needed to be fetch on the client or not
* The docker-compose file uses the local network and hence the local db running on the machine
