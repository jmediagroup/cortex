#!/bin/bash
# Test Resend API directly
# Usage: ./scripts/test-resend.sh your@email.com

if [ -z "$RESEND_API_KEY" ]; then
  echo "❌ RESEND_API_KEY environment variable is not set"
  echo "Set it with: export RESEND_API_KEY=re_your_key_here"
  exit 1
fi

EMAIL="${1:-}"
if [ -z "$EMAIL" ]; then
  echo "Usage: ./scripts/test-resend.sh your@email.com"
  exit 1
fi

echo "🔍 Testing Resend API..."
echo "📧 Sending test email to: $EMAIL"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"from\": \"Cortex <noreply@cortex.vip>\",
    \"to\": [\"$EMAIL\"],
    \"subject\": \"Resend Test - Cortex\",
    \"html\": \"<h1>Test Successful!</h1><p>Resend is working correctly.</p><p>Sent at: $(date -u +%Y-%m-%dT%H:%M:%SZ)</p>\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! Check your inbox."
else
  echo "❌ Failed. Check the error above."

  if echo "$BODY" | grep -q "not verified"; then
    echo ""
    echo "💡 Your domain may not be verified. Check https://resend.com/domains"
  fi

  if echo "$BODY" | grep -q "Invalid API"; then
    echo ""
    echo "💡 Your API key may be invalid. Check https://resend.com/api-keys"
  fi
fi
