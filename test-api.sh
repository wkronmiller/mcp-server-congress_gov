#!/bin/bash

# Simple test script for REST API endpoints
# Usage: ./test-api.sh [base_url]

BASE_URL=${1:-"http://localhost:3000"}
API_URL="${BASE_URL}/api"

echo "Testing Congress.gov REST API at ${API_URL}"
echo "================================================"

# Test API root
echo "1. Testing API root..."
curl -s "${API_URL}" | jq -r '.name // "FAILED"'
echo

# Test info endpoints
echo "2. Testing info endpoints..."
echo "   - Overview:"
curl -s "${API_URL}/info/overview" | jq -r '.data.message // "FAILED"'
echo "   - Current Congress:"
curl -s "${API_URL}/info/current-congress" | jq -r '.data.number // "FAILED"'
echo

# Test validation (should fail)
echo "3. Testing validation..."
echo "   - Invalid collection search:"
result=$(curl -s -X POST "${API_URL}/search" \
  -H "Content-Type: application/json" \
  -d '{"collection": "invalid"}' | jq -r '.success')
if [ "$result" = "false" ]; then
  echo "   ✓ Validation working correctly"
else
  echo "   ✗ Validation failed to catch invalid input"
fi
echo

# Test valid search (will fail due to network but should validate)
echo "4. Testing valid search request..."
result=$(curl -s -X POST "${API_URL}/search" \
  -H "Content-Type: application/json" \
  -d '{"collection": "bill", "limit": 2}' | jq -r '.error.code // "SUCCESS"')
if [ "$result" = "API_ERROR" ]; then
  echo "   ✓ Request validated correctly (API_ERROR expected)"
elif [ "$result" = "SUCCESS" ]; then
  echo "   ✓ Request succeeded"
else
  echo "   ✗ Unexpected result: $result"
fi
echo

# Test subresource endpoints
echo "5. Testing subresource endpoints..."
echo "   - Query parameter format:"
result=$(curl -s "${API_URL}/subresource?parentUri=congress-gov://bill/118/hr/1&subResource=actions" | jq -r '.error.code // "SUCCESS"')
if [ "$result" = "API_ERROR" ]; then
  echo "   ✓ Request validated correctly (API_ERROR expected)"
elif [ "$result" = "SUCCESS" ]; then
  echo "   ✓ Request succeeded"
else
  echo "   ✗ Unexpected result: $result"
fi

echo "   - RESTful format:"
result=$(curl -s "${API_URL}/bills/118-hr-1/actions" | jq -r '.error.code // "SUCCESS"')
if [ "$result" = "API_ERROR" ]; then
  echo "   ✓ Request validated correctly (API_ERROR expected)"
elif [ "$result" = "SUCCESS" ]; then
  echo "   ✓ Request succeeded"
else
  echo "   ✗ Unexpected result: $result"
fi
echo

echo "================================================"
echo "API test completed"