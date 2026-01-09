# Vercel Deployment Fix for pnpm Lockfile Issues

## 🚨 Problem
Vercel deployment failing due to outdated `pnpm-lock.yaml` that doesn't match `package.json`.

## 🔧 Solutions

### Option 1: Delete and Regenerate Lockfile
```bash
# Remove old lockfile
rm pnpm-lock.yaml

# Regenerate with pnpm
npx pnpm install

# Commit new lockfile
git add pnpm-lock.yaml
git commit -m "Update pnpm lockfile for Vercel deployment"
git push
```

### Option 2: Use npm for Deployment
```bash
# Remove pnpm lockfile
rm pnpm-lock.yaml

# Generate npm lockfile
npm install

# Commit npm lockfile
git add package-lock.json
git commit -m "Switch to npm lockfile for Vercel deployment"
git push
```

### Option 3: Update Vercel Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Option 4: Force Update Dependencies
```bash
# Update all dependencies
npx pnpm update

# Install fresh
npx pnpm install --force
```

## 🚀 Recommended Solution

**Use Option 1** - Delete and regenerate pnpm lockfile:

1. **Delete old lockfile:**
   ```bash
   rm pnpm-lock.yaml
   ```

2. **Regenerate fresh lockfile:**
   ```bash
   npx pnpm install
   ```

3. **Commit and push:**
   ```bash
   git add pnpm-lock.yaml
   git commit -m "Update pnpm lockfile for Vercel deployment"
   git push
   ```

4. **Redeploy to Vercel**

## 📋 Why This Happens

- **Dependencies were added** (eslint, qrcode, otplib, resend, etc.)
- **Lockfile became outdated** compared to package.json
- **Vercel uses frozen-lockfile** by default in CI
- **Mismatch causes deployment failure**

## 🔍 Verification

After fixing, verify:
```bash
# Check lockfile is up to date
npx pnpm install --dry-run

# Test build locally
npm run build

# Deploy to Vercel
vercel --prod
```

This should resolve the Vercel deployment issues! 🚀
