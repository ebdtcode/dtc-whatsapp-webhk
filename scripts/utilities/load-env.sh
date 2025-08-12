#!/bin/bash

# Load environment variables from .env file
# This script should be sourced by other scripts: source ./load-env.sh

# Check if .env file exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found. Using environment variables from system."
fi

# Verify required variables are set
check_required_vars() {
    local missing_vars=()
    
    if [ -z "$SYSTEM_USER_ACCESS_TOKEN" ]; then
        missing_vars+=("SYSTEM_USER_ACCESS_TOKEN")
    fi
    
    if [ -z "$PHONE_NUMBER_ID" ]; then
        missing_vars+=("PHONE_NUMBER_ID")
    fi
    
    if [ -z "$WEBHOOK_VERIFY_TOKEN" ]; then
        missing_vars+=("WEBHOOK_VERIFY_TOKEN")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these in your .env file or environment"
        return 1
    fi
    
    echo "✅ All required environment variables are set"
    return 0
}

# Export for use in scripts
export SYSTEM_USER_ACCESS_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"
export PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"
export WEBHOOK_VERIFY_TOKEN="${WEBHOOK_VERIFY_TOKEN}"
export APP_SECRET="${APP_SECRET}"
export APP_ID="${APP_ID}"