#!/bin/bash

# Deploy to Vercel with proper project name
PROJECT_NAME="fuzzys-home-school"

echo "Deploying to Vercel as $PROJECT_NAME..."

# Create project if it doesn't exist
vercel projects add $PROJECT_NAME 2>/dev/null || true

# Link to the project
echo "$PROJECT_NAME" | vercel link --yes 2>&1

# Add environment variables
echo "Adding environment variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production --force < <(echo "https://ggntuptvqxditgxtnsex.supabase.co")
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTAxMTYsImV4cCI6MjA3NDU4NjExNn0.pVVcvkFYRWb8STJB5OV-EQKSiPqSVO0gjfcbnCcTrt8")
vercel env add SUPABASE_SERVICE_ROLE_KEY production --force < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAxMDExNiwiZXhwIjoyMDc0NTg2MTE2fQ.3mNh9vlcJOwrK1IciLrtQa7HEUUps4rA_hjWoPzA0vQ")
vercel env add DEEPSEEK_API_KEY production --force < <(echo "sk-530e0392af584ca394e5486618a20a3e")
vercel env add OPENAI_API_KEY production --force < <(echo "sk-530e0392af584ca394e5486618a20a3e")
vercel env add OPENAI_BASE_URL production --force < <(echo "https://api.deepseek.com")
vercel env add NEXT_PUBLIC_APP_URL production --force < <(echo "https://fuzzyandfriends.com")

# Deploy to production
echo "Deploying to production..."
vercel --prod --yes

echo "Deployment complete!"
echo "Visit your app at: https://$PROJECT_NAME.vercel.app"