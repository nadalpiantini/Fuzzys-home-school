# 📚 Database Migration Instructions for Fuzzy's Home School

## ✅ Current Status

### Already Applied (Class Management - 010)
- ✅ classes table (enhanced)
- ✅ enrollments table
- ✅ assignments table (enhanced)
- ✅ submissions table
- ✅ class_announcements table
- ✅ class_resources table
- ✅ attendance table
- ✅ class_schedule table

### Needs to be Applied (Educational Platforms - 011)
- ❌ educational_platforms table
- ❌ educational_content table
- ❌ student_content_progress table
- ❌ student_skill_assessments table
- ❌ ai_quizzes table
- ❌ quiz_attempts table
- ❌ game_participants table (enhancement)
- ❌ srs_cards table
- ❌ srs_review_history table
- ❌ learning_analytics table
- ❌ content_recommendations table

## 🚀 How to Apply the Migrations

### Option 1: Supabase Dashboard (Recommended)

1. **Access your Supabase Dashboard**
   - Go to: https://ggntuptvqxditgxtnsex.supabase.co
   - Log in with your credentials

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Apply Migration 011_educational_platforms.sql**
   - Copy the entire content from: `supabase/migrations/011_educational_platforms.sql`
   - Paste it into the SQL editor
   - Click "Run" button
   - Wait for confirmation (should take ~10-30 seconds)

4. **Verify the Migration**
   - Run this verification script:
   ```bash
   node scripts/test-supabase-connection.js
   ```
   - All tables should show "✅ Accessible"

### Option 2: Using Supabase CLI (If configured)

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref ggntuptvqxditgxtnsex

# Apply the migration
npx supabase db push
```

### Option 3: Direct Application Script

```bash
# Run the automated migration script
node scripts/apply-migrations.js
```

## 🔍 Verification Steps

After applying the migrations, verify everything is working:

1. **Check all tables exist:**
   ```bash
   node scripts/test-supabase-connection.js
   ```

2. **Test the API endpoints:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Check console for any database errors
   ```

3. **Verify RLS policies:**
   - Try to access tables as different user roles
   - Ensure proper permissions are enforced

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Order Matters**: Apply migrations in order (010 before 011)
3. **Idempotent**: The migrations use "IF NOT EXISTS" so they're safe to run multiple times
4. **RLS Enabled**: Row Level Security is enabled on all tables - make sure auth is properly configured

## 🛠️ Troubleshooting

### If you get permission errors:
- Make sure you're using the service role key for migrations
- Check that RLS policies are correctly configured

### If tables already exist:
- The migrations use "IF NOT EXISTS" so this shouldn't be a problem
- You can safely re-run the migrations

### If you get syntax errors:
- Make sure you're copying the entire SQL file
- Check that you're not missing any semicolons
- Verify the SQL editor doesn't have any previous statements

## 📊 What These Migrations Enable

### Class Management System (010) ✅
- Complete teacher dashboard functionality
- Student enrollment management
- Assignment creation and submission
- Attendance tracking
- Class resources and announcements

### Educational Platforms (011) 🚀
- H5P interactive content integration
- AI-powered quiz generation with DeepSeek
- Spaced repetition system (Anki-style)
- Live gaming sessions (Kahoot-style)
- Advanced learning analytics
- Adaptive learning recommendations
- Skill assessment and tracking

## 🔗 Next Steps

After migrations are applied:

1. **Update tRPC routers** - Create the new API endpoints
2. **Implement AI integration** - Connect DeepSeek for quiz generation
3. **Setup Realtime** - Configure Supabase Realtime for live games
4. **Build UI components** - Create the frontend interfaces
5. **Test everything** - Run E2E tests to ensure functionality

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Review the error messages in the browser console
3. Run the test script: `node scripts/test-supabase-connection.js`
4. Check the migration files for any syntax issues