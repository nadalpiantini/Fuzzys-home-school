# Environment Variables Setup

## Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Optional Variables

```bash
# Enable service role checks
CHECK_SERVICE_ROLE=1

# Sentry configuration
SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1
```

## Setup Instructions

1. Copy the required variables to your `.env.local` file
2. Replace the placeholder values with your actual Supabase credentials
3. Run `npm run build` to verify the setup

## Production Deployment

These variables should be configured in your Vercel project settings under Environment Variables.
