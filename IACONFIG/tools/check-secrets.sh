#!/bin/bash
# Pre-commit Hook: Secret Detection
# Prevents committing hardcoded secrets to git

echo "🔍 Checking for hardcoded secrets..."

# Define patterns to search for
PATTERNS=(
  "sk_live_"           # Stripe live keys
  "pk_live_"           # Stripe publishable keys
  "password\s*=\s*[\"']"  # Password assignments
  "api_key\s*=\s*[\"']"   # API key assignments
  "AKIA"               # AWS access keys
  "private_key"        # Private keys
)

FOUND=0

# Search for each pattern
for pattern in "${PATTERNS[@]}"; do
  if git diff --cached --diff-filter=ACM | grep -iE "$pattern" > /dev/null; then
    echo "❌ ERROR: Potential secret detected: $pattern"
    echo "   Found in staged files. Please remove hardcoded secrets."
    FOUND=1
  fi
done

# Check for .env files
if git diff --cached --name-only | grep -E "^\.env$" > /dev/null; then
  echo "❌ ERROR: Attempting to commit .env file"
  echo "   Add .env to .gitignore and use .env.example instead"
  FOUND=1
fi

if [ $FOUND -eq 1 ]; then
  echo ""
  echo "💡 How to fix:"
  echo "   1. Move secrets to .env file"
  echo "   2. Use process.env.SECRET_NAME in code"
  echo "   3. Ensure .env is in .gitignore"
  echo "   4. Commit .env.example instead (with fake values)"
  exit 1
fi

echo "✅ No secrets detected"
exit 0
