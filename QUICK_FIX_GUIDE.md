# Quick Fix Script for Two-Step Signup Issues

## 🚨 Common Issues and Solutions

### Issue 1: Database Schema Not Updated
**Problem**: `user_activations` table doesn't support null `user_id`

**Solution**: Run this SQL in Supabase SQL Editor:
```sql
-- Drop and recreate with proper schema
DROP TABLE IF EXISTS public.user_activations CASCADE;

CREATE TABLE public.user_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  activation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  is_activated BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activation_token),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "System can manage activations" ON public.user_activations FOR ALL USING (true);

-- Add is_activated to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;
```

### Issue 2: Environment Variables Missing
**Problem**: Email sending fails due to missing environment variables

**Solution**: Check your `.env.local` file:
```env
RESEND_API_KEY=re_jdAvHAug_8MLk9ZLxyxP7dvGRzubcSrPU
RESEND_FROM_EMAIL=noreply@phishguard.ai
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Issue 3: TypeScript/Build Errors
**Problem**: Import errors or type issues

**Solution**: Check these imports:
```typescript
// In create-password/page.tsx
import { Alert, AlertDescription } from "@/components/ui/alert"

// In send-activation/route.ts
import { createClient } from '@/lib/supabase/server'
```

### Issue 4: Email Not Sending
**Problem**: No activation emails received

**Solution**: Test email system:
```bash
# Test email endpoint
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmadraja984821@gmail.com"}'
```

### Issue 5: Activation Link Not Working
**Problem**: Token validation fails

**Solution**: Check activation record in database:
```sql
-- Check activation records
SELECT * FROM public.user_activations WHERE email = 'your-email@example.com';

-- Check if token exists and is not expired
SELECT * FROM public.user_activations 
WHERE activation_token = 'your-token-here' 
AND expires_at > NOW();
```

## 🔧 Quick Fix Steps

### Step 1: Update Database
1. Open Supabase SQL Editor
2. Copy and paste the SQL above
3. Click "RUN"

### Step 2: Verify Environment
1. Check `.env.local` file exists
2. Verify all variables are set
3. Restart dev server: `npm run dev`

### Step 3: Test Email System
1. Visit `/auth/sign-up`
2. Enter your email
3. Check if email arrives
4. If not, check browser console for errors

### Step 4: Test Activation Flow
1. Click activation link from email
2. Should redirect to `/auth/create-password`
3. Set password and create account
4. Try login with new credentials

## 🐛 Debug Commands

```bash
# Check for build errors
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Start with verbose logging
npm run dev -- --verbose

# Check environment variables
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL
```

## 📧 Email Testing

If emails aren't sending, test with this endpoint:
- Visit: `http://localhost:3000/api/test-email`
- Or use curl command above

## 🚨 If Still Not Working

1. **Check browser console** for JavaScript errors
2. **Check terminal** for server errors
3. **Check Supabase logs** for database errors
4. **Check Resend dashboard** for email delivery status

Run these fixes in order and test each step!
