# organisation


<b>Installation guide:</b>
* Install node (for npm)
* Install postgres
* Create two db named ```postgres``` and another ```test``` running on port ```5432``` with ```username: postgres``` & ```password: admin```
* Install docker



<b>Running the tests</b>
- ```npm test```



<b>Running the application</b>
1. ```docker-compose build```
2. ```docker-compose up```


Endpoints can be accessed via 

1. ```localhost:5000/api/organization to create an organization (POST) ```
2. ```localhost:5000/api/organization?offset=0&organization_id=<value> (GET)```
