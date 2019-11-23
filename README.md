# organisation


* Language : Nodejs
* Database: Postgres
* Containerization : Docker

## Installation guide:
* Install node (for npm)
* Install postgres
* Create two db named ```postgres``` and another ```test``` running on port ```5432``` with ```username: postgres``` & ```password: admin```
* Install docker & docker-compose



## Running the tests
- ```npm test```
Note: Uses a separate test db and its truncated each time it runs



## Running the application
1. ```docker-compose build```
2. ```docker-compose up```

Note: Use -d flag to make it run in the background.

Use ```docker-compose down``` to stop the process


###### Endpoints can be accessed via 

1. ```localhost:5000/api/organization to create an organization (POST) ```
2. ```localhost:5000/api/organization?offset=0&organization_name=<value> (GET)```


###### Overview 
* Ajv validator to validate the inputs
* ```deployment.json``` which overides environment specific configuration when needed
* The endpoints are defined in the rest files and the service layer code is served by the files in services folder
* The Database related schema and models are defined on the ```db``` folder. Querys are defined in the BaesModel Class.
* The POST method recursively adds organisations and maintains its children, parents and sisters.
* The GET organisation response has moreAvailable property which tells us whether more paginated items needed to be fetch on the client or not
* The docker-compose file uses the local network and hence the local db running on the machine

###### Enhancements
* Introduce indexing so that relations can be fetched faster(faster reads)
* Import the post data and push it to a queue (Rabbitmq) and process it later.
* Introduce Node clustering.

