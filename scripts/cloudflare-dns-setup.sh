#!/bin/bash

# Configure Cloudflare DNS for fuzzyandfriends.com to point to Vercel

echo "Setting up DNS records for fuzzyandfriends.com..."

# Get the zone ID for the domain
ZONE_ID=$(npx wrangler domains list | grep fuzzyandfriends.com | awk '{print $2}')

if [ -z "$ZONE_ID" ]; then
    echo "Domain fuzzyandfriends.com not found in Cloudflare. Adding it..."
    npx wrangler domains add fuzzyandfriends.com
    ZONE_ID=$(npx wrangler domains list | grep fuzzyandfriends.com | awk '{print $2}')
fi

echo "Zone ID: $ZONE_ID"

# Delete existing A and CNAME records if they exist
echo "Cleaning up existing records..."
npx wrangler dns records list --zone-id $ZONE_ID | grep -E "^A|^CNAME" | awk '{print $1}' | while read RECORD_ID; do
    npx wrangler dns records delete --zone-id $ZONE_ID --id $RECORD_ID
done

# Add A record for root domain
echo "Adding A record for fuzzyandfriends.com..."
npx wrangler dns records create --zone-id $ZONE_ID --type A --name @ --content 76.76.21.21 --proxied false

# Add A record for www
echo "Adding A record for www.fuzzyandfriends.com..."
npx wrangler dns records create --zone-id $ZONE_ID --type A --name www --content 76.76.21.21 --proxied false

# List all DNS records
echo "Current DNS records:"
npx wrangler dns records list --zone-id $ZONE_ID

echo "DNS configuration complete!"
echo "Please wait 5-10 minutes for DNS propagation."
echo "Your site will be available at:"
echo "  - https://fuzzyandfriends.com"
echo "  - https://www.fuzzyandfriends.com"