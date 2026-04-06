# Endpoint Map (Shared + Relationship-Ready)

Base URL examples assume:

- <http://localhost:8000>

## Dealerships CRUD (Master)

- GET /dealerships
- GET /dealerships/{dealershipId}
- POST /dealerships
- PUT /dealerships/{dealershipId}
- DELETE /dealerships/{dealershipId}

## Cars CRUD (Detail)

- GET /cars
- GET /cars/{carId}
- POST /cars
- PUT /cars/{carId}
- DELETE /cars/{carId}

## Relationship Endpoints

- GET /dealerships/{dealershipId}/cars
- GET /dealerships/{dealershipId}/cars/{carId}

## Minimal curl Checks

### Read all dealerships

curl -s <http://localhost:8000/dealerships>

### Read all cars

curl -s <http://localhost:8000/cars>

### Create dealership

curl -s -X POST <http://localhost:8000/dealerships> \
  -H 'Content-Type: application/json' \
  -d '{"name":"Delaware Auto Group","city":"Wilmington","state":"DE"}'

### Create car

curl -s -X POST <http://localhost:8000/cars> \
  -H 'Content-Type: application/json' \
  -d '{"make":"Toyota","model":"Camry","year":2022,"price":27995,"vin":"1ABC234DEF5678901","dealership_id":9}'

### Update dealership

curl -s -X PUT <http://localhost:8000/dealerships/9> \
  -H 'Content-Type: application/json' \
  -d '{"name":"Delaware Auto Group North","city":"Newark","state":"DE"}'

### Delete car

curl -s -X DELETE <http://localhost:8000/cars/19>

## SQL Verification Query (join)

SELECT c.make, c.model, d.name AS dealership_name
FROM cars c
JOIN dealerships d ON c.dealership_id = d.id
ORDER BY d.name, c.make, c.model;
