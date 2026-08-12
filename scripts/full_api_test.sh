#!/bin/bash
BASE="https://chust-express-backend.onrender.com"
PASS=0
FAIL=0

green() { echo -e "\e[32m✅ $1\e[0m"; }
red()   { echo -e "\e[31m❌ $1\e[0m"; }

check() {
  local label="$1"
  local result="$2"
  local expect="$3"
  if echo "$result" | grep -q "$expect"; then
    green "$label"
    PASS=$((PASS+1))
  else
    red "$label"
    echo "   Response: $result"
    FAIL=$((FAIL+1))
  fi
}

echo "=============================="
echo "  LIVE API FULL TEST"
echo "=============================="

# 1. Health check
echo -e "\n--- 1. Health Check ---"
R=$(curl -s "$BASE/api/health")
check "Health endpoint reachable" "$R" "database"

# 2. Admin Login
echo -e "\n--- 2. Admin Login ---"
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delivery.com","password":"t#K8jM3$R!"}')
check "Admin login success" "$LOGIN" '"success":true'
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

# 3. Get Products
echo -e "\n--- 3. Get Products ---"
R=$(curl -s "$BASE/api/products")
check "Get products returns 200" "$R" '"success":true'

# 4. Create Product
echo -e "\n--- 4. Create Product ---"
R=$(curl -s -X POST "$BASE/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"API Full Test Product XYZ","price":9999,"stock":5,"images":["https://placehold.co/400x300"],"category":"Test","weight":1.0,"shopAddress":"Test Street"}')
check "Create product success" "$R" '"success":true'
PRODUCT_ID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
echo "   Product ID: $PRODUCT_ID"

# 5. Get single product
echo -e "\n--- 5. Get Single Product ---"
if [ -n "$PRODUCT_ID" ]; then
  R=$(curl -s "$BASE/api/products/$PRODUCT_ID")
  check "Get product by ID" "$R" '"success":true'
fi

# 6. Update product
echo -e "\n--- 6. Update Product ---"
if [ -n "$PRODUCT_ID" ]; then
  R=$(curl -s -X PUT "$BASE/api/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"price":8888,"stock":10}')
  check "Update product success" "$R" '"success":true'
fi

# 7. Seller stats
echo -e "\n--- 7. Seller Stats ---"
R=$(curl -s "$BASE/api/products/seller/stats" \
  -H "Authorization: Bearer $TOKEN")
check "Seller stats accessible" "$R" '"success":true'

# 8. Categories
echo -e "\n--- 8. Categories ---"
R=$(curl -s "$BASE/api/products/categories")
check "Categories endpoint works" "$R" '"success":true'

# 9. Delete test product
echo -e "\n--- 9. Cleanup ---"
if [ -n "$PRODUCT_ID" ]; then
  R=$(curl -s -X DELETE "$BASE/api/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN")
  check "Delete test product" "$R" '"success":true'
fi

# 10. Orders endpoint
echo -e "\n--- 10. Orders ---"
R=$(curl -s "$BASE/api/orders" -H "Authorization: Bearer $TOKEN")
check "Orders endpoint accessible" "$R" '"success":true'

echo ""
echo "=============================="
echo "  RESULTS: ✅ $PASS passed | ❌ $FAIL failed"
echo "=============================="
