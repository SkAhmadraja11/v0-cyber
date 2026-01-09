# Email Sending Issues - Complete Fix Guide

## 🚨 Problem
Emails are not being sent to users during signup/activation.

## 🔧 Step-by-Step Debug & Fix

### Step 1: Test Email System
Visit: `https://next-gen-cyber.vercel.app/api/debug-email`

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "data": {
    "emailId": "xxx",
    "from": "noreply@phishguard.ai",
    "to": "ahmadraja984821@gmail.com"
  }
}
```

**If Error:**
```json
{
  "error": "RESEND_API_KEY not configured",
  "config": {
    "RESEND_API_KEY": "❌ Missing",
    "RESEND_FROM_EMAIL": "❌ Missing"
  }
}
```

### Step 2: Fix Environment Variables

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these variables:

```env
RESEND_API_KEY=re_jdAvHAug_8MLk9ZLxyxP7dvGRzubcSrPU
RESEND_FROM_EMAIL=noreply@phishguard.ai
NEXT_PUBLIC_APP_URL=https://next-gen-cyber.vercel.app
```

3. **Redeploy** after adding variables

### Step 3: Verify Resend Setup

**In Resend Dashboard:**
1. **Check API Key**: Make sure `re_jdAvHAug_8MLk9ZLxyxP7dvGRzubcSrPU` is valid
2. **Check Domain**: Verify `phishguard.ai` domain is set up
3. **Check From Email**: Make sure `noreply@phishguard.ai` is verified

**If domain not verified:**
1. Go to Resend → Domains
2. Add `phishguard.ai` domain
3. Add DNS records to your domain provider
4. Wait for verification

### Step 4: Alternative Email Setup

**If Resend not working, use Gmail:**

```env
# Gmail SMTP (less reliable for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Step 5: Test Full Flow

After fixing environment variables:

1. **Test email debug endpoint**:
   ```
   POST https://next-gen-cyber.vercel.app/api/debug-email
   ```

2. **Test signup flow**:
   - Visit: `https://next-gen-cyber.vercel.app/auth/sign-up`
   - Enter email
   - Check if email arrives

3. **Test activation flow**:
   - Click activation link from email
   - Should redirect to password creation page

## 🔍 Common Issues & Solutions

### Issue 1: "RESEND_API_KEY not configured"
**Fix**: Add RESEND_API_KEY to Vercel environment variables

### Issue 2: "Invalid API key"
**Fix**: 
- Check Resend dashboard for valid API key
- Generate new API key if needed

### Issue 3: "Domain not verified"
**Fix**:
- Add domain to Resend dashboard
- Add DNS records to domain provider
- Wait for DNS propagation

### Issue 4: "From email not verified"
**Fix**:
- Verify sender domain in Resend
- Use verified email address

### Issue 5: "Rate limit exceeded"
**Fix**:
- Check Resend usage limits
- Upgrade Resend plan if needed

## 🚀 Quick Fix Script

Create `fix-email.sh`:
```bash
#!/bin/bash
echo "🔧 Fixing email configuration..."

# Test current setup
curl -X POST https://next-gen-cyber.vercel.app/api/debug-email

echo "📧 If test fails, check:"
echo "1. Vercel environment variables"
echo "2. Resend API key validity"
echo "3. Domain verification in Resend"
echo "4. From email verification"
```

## 📋 Verification Checklist

- [ ] RESEND_API_KEY added to Vercel
- [ ] RESEND_FROM_EMAIL added to Vercel
- [ ] NEXT_PUBLIC_APP_URL set correctly
- [ ] Resend domain verified
- [ ] From email verified
- [ ] Test email sent successfully
- [ ] Signup flow working
- [ ] Activation emails arriving

**Run the debug endpoint first to identify the specific issue!** 🔧
