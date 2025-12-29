# 🔐 Google OAuth Setup - Final Configuration Guide

## Your Credentials

**Google OAuth Client ID:** `7e26617f-399e-4d9a-9e25-f884e107e8b6`

**Supabase Project:**
- Project ID: `ghtgjwxtljqhlybbnhzq`
- Project URL: `https://ghtgjwxtljqhlybbnhzq.supabase.co`
- Callback URL: `https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback`

---

## ✅ Step-by-Step Setup Checklist

### Step 1: Google Cloud Console Configuration

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project:**
   - If you already have a project with Client ID `7e26617f-399e-4d9a-9e25-f884e107e8b6`, select it
   - Otherwise, create a new project

3. **Configure OAuth Consent Screen:**
   - Go to: **APIs & Services** → **OAuth consent screen**
   - Select **External** user type (unless you have Google Workspace)
   - Fill in required fields:
     - **App name:** PhishGuard AI
     - **User support email:** Your email address
     - **Developer contact:** Your email address
   - Click **Save and Continue**
   - Skip optional scopes
   - Add test users (your email) if in testing mode
   - Click **Save and Continue**

4. **Get OAuth Credentials:**
   - Go to: **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID: `7e26617f-399e-4d9a-9e25-f884e107e8b6`
   - Click the edit icon (pencil)
   
5. **Add Authorized Redirect URIs:**
   - Under **Authorized redirect URIs**, add:
     ```
     https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback
     ```
   - **IMPORTANT:** This URL must be EXACT (no trailing slash, case-sensitive)
   - Click **Save**

6. **Copy Client Secret:**
   - You should see both **Client ID** and **Client Secret**
   - Copy the **Client Secret** (you'll need it for Supabase)

---

### Step 2: Supabase Dashboard Configuration

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/ghtgjwxtljqhlybbnhzq
   - Sign in to your account

2. **Enable Google Provider:**
   - Navigate to: **Authentication** → **Providers**
   - Scroll down to find **Google**
   - Toggle the switch to **Enable**

3. **Enter Google Credentials:**
   - **Client ID (OAuth):** `7e26617f-399e-4d9a-9e25-f884e107e8b6`
   - **Client Secret (OAuth):** [Paste the secret from Google Cloud Console]
   - **Skip nonce check:** Leave unchecked (default)

4. **Save Configuration:**
   - Click **Save** button at the bottom
   - Wait for confirmation message

---

### Step 3: Verify Configuration

1. **Check Supabase Auth Settings:**
   - In Supabase Dashboard: **Authentication** → **URL Configuration**
   - Verify **Site URL** is set correctly
   - Verify **Redirect URLs** includes your app domain

2. **Test Google OAuth:**
   - Go to your app: `/auth/login`
   - Click **"Continue with Google"**
   - You should see Google's OAuth consent screen
   - Select your Google account
   - Grant permissions
   - You should be redirected back to `/dashboard`

---

## 🚨 Troubleshooting Common Issues

### Issue: "This content is blocked. Contact the site owner to fix the issue."

**Cause:** Redirect URI mismatch or Google OAuth not properly configured

**Solution:**
1. Verify the redirect URI in Google Cloud Console exactly matches:
   ```
   https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback
   ```
2. Make sure there are no typos, trailing slashes, or case differences
3. Wait 5-10 minutes after saving for changes to propagate

---

### Issue: "OAuth provider not enabled"

**Cause:** Google provider not enabled in Supabase

**Solution:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Find Google and toggle it to **Enabled**
3. Make sure you clicked **Save** after adding credentials

---

### Issue: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not properly configured

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure you completed all required fields
3. If using External user type, add your email to Test Users
4. Publish the app (or keep in testing mode with test users added)

---

### Issue: "Redirect URI mismatch"

**Cause:** The redirect URI doesn't match what's configured in Google

**Solution:**
1. The callback URL MUST be: `https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback`
2. Check for:
   - No trailing slash
   - Correct protocol (https)
   - Exact subdomain match
   - No extra parameters

---

## 🔍 Debug Mode

Your app has built-in debug logging. Check browser console (F12) for:
- `[v0] Starting Google OAuth with redirect: ...` - Shows the redirect URL being used
- `[v0] OAuth initiated successfully` - OAuth flow started
- `[v0] OAuth error:` - Shows any errors from Supabase
- `[v0] OAuth callback successful` - Callback processed successfully

---

## 📝 Testing Checklist

- [ ] Google Cloud Console project created/selected
- [ ] OAuth consent screen configured
- [ ] Client ID matches: `7e26617f-399e-4d9a-9e25-f884e107e8b6`
- [ ] Redirect URI added: `https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback`
- [ ] Client Secret copied
- [ ] Supabase Google provider enabled
- [ ] Client ID and Secret added to Supabase
- [ ] Configuration saved in Supabase
- [ ] Test user added (if in testing mode)
- [ ] Login with Google button works
- [ ] User redirected to Google OAuth consent
- [ ] User can grant permissions
- [ ] User redirected back to dashboard
- [ ] User session persists on refresh

---

## 🎯 Alternative Authentication Methods

While setting up Google OAuth, users can also:

1. **Email/Password Sign Up:**
   - Go to `/auth/sign-up`
   - Enter email, password, and full name
   - Verify email via link sent to inbox

2. **Face Verification (Demo):**
   - Go to `/auth/face-verify`
   - Allow camera access
   - Complete face scan for human verification

---

## 📞 Need Help?

If you're still experiencing issues after following this guide:

1. Check browser console for detailed error messages (F12)
2. Check Supabase logs: Dashboard → Logs → Auth
3. Verify all URLs are exactly correct (copy-paste recommended)
4. Wait 5-10 minutes after configuration changes
5. Try in incognito/private browsing mode
6. Clear browser cache and cookies

---

## ✨ What's Working Now

Your PhishGuard AI platform has:
- ✅ Email/Password authentication
- ✅ Google OAuth (once configured with secret)
- ✅ Face verification demo
- ✅ Profile management
- ✅ User settings
- ✅ Protected routes
- ✅ Session persistence
- ✅ Supabase database integration
- ✅ ML-based phishing detection
- ✅ Real-time analytics dashboard

Once you complete the OAuth setup above, Google Sign-In will be fully functional!
