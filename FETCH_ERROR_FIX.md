# 🔧 "Failed to Fetch" Error - Complete Fix

## 🚨 What This Error Means:
- **Network request failed**
- **API endpoint not responding**
- **Server not running or crashed**
- **CORS or routing issues**

## 🚀 Quick Fix Steps:

### Step 1: Check if Dev Server is Running
**Run in terminal**:
```bash
cd c:\cyber-phishing\v0-cyber
npm run dev
```

**Should show**:
```
- Local: http://localhost:3000
- Network: use --host to expose
```

### Step 2: Test Basic Connection
**Open browser**: `http://localhost:3000`
**Should show**: Your application homepage

### Step 3: Test API Endpoints
**Test diagnostic**: `http://localhost:3000/api/system-diagnostic`
**Should return**: JSON with system status

### Step 4: Fix Common Issues

#### Issue A: Server Not Running
**Fix**: Start the dev server
```bash
npm run dev
```

#### Issue B: Port Already in Use
**Fix**: Kill process and restart
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Restart dev server
npm run dev
```

#### Issue C: Environment Variables Missing
**Fix**: Update `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://c53a1951b94788df49503a5e83acfa53e8469cbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Issue D: API Route Errors
**Fix**: Check for TypeScript errors
```bash
npx tsc --noEmit
```

## 🔍 Debug Steps:

### 1. Check Server Status
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check Node processes
tasklist | findstr node.exe
```

### 2. Test Simple API
**Create test file**: `test-api.js`
```javascript
fetch('http://localhost:3000/api/system-diagnostic')
  .then(response => response.json())
  .then(data => console.log('API Working:', data))
  .catch(error => console.error('API Error:', error))
```

### 3. Check Browser Console
**Press F12** → **Console tab**
**Look for**: Network errors, CORS issues, JavaScript errors

## 🎯 Expected Results:

### ✅ Working:
- Dev server running on `http://localhost:3000`
- API endpoints responding
- No "Failed to fetch" errors
- Authentication working

### ❌ Not Working:
- Server not running
- Port conflicts
- Environment issues
- API route errors

## 📋 Immediate Actions:

1. **Start dev server**: `npm run dev`
2. **Test homepage**: `http://localhost:3000`
3. **Test API**: `http://localhost:3000/api/system-diagnostic`
4. **Check console** for errors
5. **Fix environment** variables if needed

## 🚨 If Still Failing:

### Reset Everything:
```bash
# Clear node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### Check Supabase Connection:
- Verify URL: `https://c53a1951b94788df49503a5e83acfa53e8469cbc.supabase.co`
- Check API key is valid
- Test in Supabase dashboard

**The "Failed to fetch" error is usually because the dev server isn't running. Start it first!** 🔧
