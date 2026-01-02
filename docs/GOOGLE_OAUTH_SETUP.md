# Google OAuth Setup Guide

To enable Google Sign-In for your PhishGuard AI platform, follow these steps:

## 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add the following authorized redirect URIs:
   - `https://hntttwcudnetgufhpelf.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
8. Copy your **Client ID** and **Client Secret**

## 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/hntttwcudnetgufhpelf)
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to expand
4. Enable Google authentication
5. Paste your Google **Client ID** and **Client Secret**
6. Save the configuration

## 3. Test the Integration

1. Navigate to `/auth/login` or `/auth/sign-up`
2. Click "Continue with Google" or "Sign up with Google"
3. You should be redirected to Google's OAuth consent screen
4. After granting permissions, you'll be redirected back to the dashboard

## Troubleshooting

### Common Issues:

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Cloud Console exactly matches: `https://hntttwcudnetgufhpelf.supabase.co/auth/v1/callback`

**Error: "OAuth provider not enabled"**
- Ensure Google provider is enabled in Supabase Dashboard under Authentication > Providers

**Error: "Invalid credentials"**
- Double-check that Client ID and Client Secret are correctly copied from Google Cloud Console to Supabase

**Stuck on loading after clicking Google button**
- Check browser console for errors
- Verify popup blockers are disabled
- Try clearing browser cache and cookies

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for sensitive data in production
- Regularly rotate OAuth secrets
- Monitor OAuth usage in Google Cloud Console
