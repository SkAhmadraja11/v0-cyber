# Complete Vercel Deployment Fix

## 🚨 Current Issue
Vercel CLI needs authentication token to deploy.

## 🔧 Step-by-Step Fix

### Step 1: Login to Vercel
```bash
# Login to Vercel (opens browser)
npx vercel login
```

### Step 2: Link Project
```bash
# Link to existing Vercel project or create new
npx vercel link
```

### Step 3: Deploy
```bash
# Deploy to production
npx vercel --prod
```

## 🚀 Alternative: Use Vercel Dashboard

1. **Go to**: [vercel.com](https://vercel.com)
2. **Import GitHub repository**
3. **Connect your project**
4. **Configure build settings**:
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`
5. **Deploy** with automatic GitHub integration

## 🛠️ Environment Variables Setup

In Vercel Dashboard, add these environment variables:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
RESEND_API_KEY=re_jdAvHAug_8MLk9ZLxyxP7dvGRzubcSrPU
RESEND_FROM_EMAIL=noreply@phishguard.ai
NEXT_PUBLIC_SUPABASE_URL=https://hntttwcudnetgufhpelf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔍 Debug Deployment Issues

### Check Build Logs
```bash
# Check recent deployments
npx vercel ls

# Check deployment logs
npx vercel logs

# Inspect build
npx vercel inspect
```

### Local Testing
```bash
# Test production build locally
npm run build

# Test production server
npm start
```

## 📋 Quick Fix Script

Create `fix-deploy.sh`:
```bash
#!/bin/bash
echo "🚀 Fixing Vercel deployment..."

# Step 1: Clean dependencies
echo "📁 Cleaning dependencies..."
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Step 2: Install with npm
echo "📦 Installing with npm..."
npm install

# Step 3: Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Step 4: Login to Vercel
    echo "🔐 Login to Vercel..."
    npx vercel login
    
    # Step 5: Link project
    echo "🔗 Linking project..."
    npx vercel link
    
    # Step 6: Deploy
    echo "🚀 Deploying..."
    npx vercel --prod
    
    echo "✅ Deployment completed!"
else
    echo "❌ Build failed. Check errors above."
    exit 1
fi
```

## 🎯 Most Likely Solutions

1. **Use Vercel Dashboard** (easiest)
2. **Login first** with `npx vercel login`
3. **Link project** with `npx vercel link`
4. **Deploy** with `npx vercel --prod`

## 🔧 If Still Issues

### Check Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Check Node Version
```bash
# Vercel uses Node.js 18.x by default
node --version

# Update if needed
nvm use 18
```

Try the **Vercel Dashboard approach** for the most reliable deployment! 🚀
