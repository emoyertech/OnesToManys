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
  -d '{"name":"Relationships Test Dealer","city":"New Castle","state":"DE"}')
echo "$NEW_DEALERSHIP" | jq .
NEW_DEALERSHIP_ID=$(echo "$NEW_DEALERSHIP" | jq -r '.id')

print_section "POST create car for new dealership"
NEW_CAR=$(curl -s -X POST "${BASE_URL}/cars" \
  -H "Content-Type: application/json" \
  -d "{\"make\":\"Subaru\",\"model\":\"Outback\",\"year\":2023,\"price\":34995,\"vin\":\"4S4BTACC8P3000010\",\"dealership_id\":${NEW_DEALERSHIP_ID}}")
echo "$NEW_CAR" | jq .
NEW_CAR_ID=$(echo "$NEW_CAR" | jq -r '.id')

print_section "GET cars for one dealership (relationship endpoint)"
curl -s "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}/cars" | jq .

print_section "GET one car for one dealership (scoped detail endpoint)"
curl -s "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}/cars/${NEW_CAR_ID}" | jq .

print_section "GET export/json"
EXPORT_JSON=$(curl -s "${BASE_URL}/export/json")
echo "${EXPORT_JSON}" | jq '.counts'

print_section "POST import/json (round trip from export)"
curl -s -X POST "${BASE_URL}/import/json" \
  -H "Content-Type: application/json" \
  -d "${EXPORT_JSON}" | jq .

print_section "PUT update dealership"
curl -s -X PUT "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Relationships Dealer","city":"Wilmington","state":"DE"}' | jq .

print_section "PUT update car"
curl -s -X PUT "${BASE_URL}/cars/${NEW_CAR_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"make\":\"Subaru\",\"model\":\"Outback Touring\",\"year\":2023,\"price\":35995,\"vin\":\"4S4BTACC8P3000010\",\"dealership_id\":${NEW_DEALERSHIP_ID}}" | jq .

print_section "DELETE car"
curl -s -X DELETE "${BASE_URL}/cars/${NEW_CAR_ID}" | jq .

print_section "DELETE dealership"
curl -s -X DELETE "${BASE_URL}/dealerships/${NEW_DEALERSHIP_ID}" | jq .

print_section "Done"
echo "All relationship checks completed."