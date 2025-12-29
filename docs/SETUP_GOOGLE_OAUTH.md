# Google OAuth Setup Guide for PhishGuard AI

## Your Google OAuth Credentials

**Client ID:** `7e26617f-399e-4d9a-9e25-f884e107e8b6`

## Step-by-Step Configuration

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ghtgjwxtljqhlybbnhzq
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click on it
4. **Enable** the Google provider
5. Enter your credentials:
   - **Client ID:** `7e26617f-399e-4d9a-9e25-f884e107e8b6`
   - **Client Secret:** (You need to provide this from Google Cloud Console)
6. Click **Save**

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already:
   - User Type: **External**
   - App name: **PhishGuard AI**
   - User support email: Your email
   - Developer contact: Your email
6. Add **Authorized redirect URIs**:
   \`\`\`
   https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback
   \`\`\`
7. Click **Create**
8. Copy the **Client Secret** and add it to Supabase (Step 1)

### 3. Verify Configuration

After setting up both sides:
1. Go to your app's login page
2. Click "Continue with Google"
3. You should see the Google OAuth consent screen
4. After approval, you'll be redirected back to your app

## Troubleshooting

### "This content is blocked" error
- Make sure you've added the correct redirect URI in Google Cloud Console
- Verify the Client ID and Secret are correctly entered in Supabase
- Check that Google OAuth provider is **enabled** in Supabase

### "Access blocked" error
- Your OAuth consent screen might be in testing mode
- Add your test users in Google Cloud Console → OAuth consent screen → Test users
- Or publish the app (requires verification for production)

### Redirect URI mismatch
- Ensure the redirect URI in Google Cloud Console exactly matches:
  \`\`\`
  https://ghtgjwxtljqhlybbnhzq.supabase.co/auth/v1/callback
  \`\`\`
- No trailing slashes, must be exact

## Testing

Once configured, test the OAuth flow:
1. Visit: `/auth/login`
2. Click "Continue with Google"
3. Select your Google account
4. Approve the permissions
5. You should be redirected to the home page as a logged-in user

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check Supabase logs: Dashboard → Logs → Auth
3. Verify all URLs match exactly (case-sensitive)
</parameter>
