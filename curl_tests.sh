#!/usr/bin/env bash

set -euo pipefail

BASE_URL="http://localhost:8000"

print_section() {
  echo
  echo "==================== $1 ===================="
}

print_section "GET home page"
curl -s "${BASE_URL}/" | head -n 5

print_section "GET all dealerships"
curl -s "${BASE_URL}/dealerships" | jq .

print_section "GET all cars"
curl -s "${BASE_URL}/cars" | jq .

print_section "POST create dealership"
NEW_DEALERSHIP=$(curl -s -X POST "${BASE_URL}/dealerships" \
  -H "Content-Type: application/json" \
  -d '{"name":"Commented Test Dealer","city":"New Castle","state":"DE"}')
echo "$NEW_DEALERSHIP" | jq .
NEW_DEALERSHIP_ID=$(echo "$NEW_DEALERSHIP" | jq -r '.id')

print_section "POST create car for new dealership"
NEW_CAR=$(curl -s -X POST "${BASE_URL}/cars" \
  -H "Content-Type: application/json" \
  -d "{\"make\":\"Subaru\",\"model\":\"Outback\",\"year\":2023,\"price\":34995,\"vin\":\"4S4BTACC8P3000009\",\"dealership_id\":${NEW_DEALERSHIP_ID}}")
echo "$NEW_CAR" | jq .
NEW_CAR_ID=$(echo "$NEW_CAR" | jq -r '.id')

print_section "PUT update dealership"
curl -s -X PUT "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Test Dealer","city":"Wilmington","state":"DE"}' | jq .

print_section "PUT update car"
curl -s -X PUT "${BASE_URL}/cars/${NEW_CAR_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"make\":\"Subaru\",\"model\":\"Outback Touring\",\"year\":2023,\"price\":35995,\"vin\":\"4S4BTACC8P3000009\",\"dealership_id\":${NEW_DEALERSHIP_ID}}" | jq .

print_section "DELETE car"
curl -s -X DELETE "${BASE_URL}/cars/${NEW_CAR_ID}" | jq .

print_section "DELETE dealership"
curl -s -X DELETE "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}" | jq .

print_section "GET one dealership"
curl -s "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}" | jq .

print_section "GET one car"
curl -s "${BASE_URL}/cars/${NEW_CAR_ID}" | jq .

print_section "Done"
echo "All Phase 1 CRUD checks completed."
