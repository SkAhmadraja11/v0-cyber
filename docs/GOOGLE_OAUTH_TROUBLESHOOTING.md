# Google OAuth Troubleshooting Guide

## "Content is Blocked" Error

If you're seeing a "Content is blocked" error when trying to sign in with Google, follow these steps:

### Step 1: Enable Google Auth in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hntttwcudnetgufhpelf
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**

### Step 2: Configure Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add these **Authorized redirect URIs**:
   - `https://hntttwcudnetgufhpelf.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local testing)
   - Your production URL callback (if deploying)

### Step 3: Add Google Credentials to Supabase

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
3. Paste the credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Click **Save**

### Step 4: Test the Integration

1. Clear your browser cache and cookies
2. Try signing in with Google again
3. Check the browser console for any error messages
4. Look for `[v0]` prefixed logs that show the OAuth flow

## Common Issues

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://hntttwcudnetgufhpelf.supabase.co/auth/v1/callback
```

### Issue: "OAuth not configured"
**Solution**: Ensure Google provider is enabled in Supabase and credentials are saved.

### Issue: Login works but user data not saved
**Solution**: Check that the `profiles` table exists in your database. Run the SQL scripts in the `/scripts` folder.

## Alternative: Use Email/Password

If Google OAuth continues to have issues, users can:
1. Sign up with email and password
2. Use face verification for biometric authentication
3. Add Google login later once OAuth is properly configured

## Support

For more help:
- Check Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- View console logs with `[v0]` prefix for debugging
- Contact your administrator to verify OAuth setup
