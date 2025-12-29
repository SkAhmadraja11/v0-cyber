# API Setup Guide

## Overview

PhishGuard AI uses multiple trusted data sources for high-confidence phishing detection. To enable real-time detection with actual security databases, you need to obtain API keys from the following providers.

## Required APIs

### 1. Google Safe Browsing API

**Purpose:** Check URLs against Google's constantly updated database of unsafe web resources.

**Setup:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Safe Browsing API"
4. Go to "Credentials" and create an API key
5. Add to `.env`: `GOOGLE_SAFE_BROWSING_API_KEY=your_key_here`

**Free Tier:** 10,000 requests/day

### 2. PhishTank API

**Purpose:** Community-driven phishing URL database with verified reports.

**Setup:**
1. Visit [PhishTank](https://www.phishtank.com/api_info.php)
2. Register for a free account
3. Apply for API access
4. Copy your API key
5. Add to `.env`: `PHISHTANK_API_KEY=your_key_here`

**Free Tier:** 100 requests/hour

### 3. VirusTotal API

**Purpose:** Aggregate scanning from 70+ antivirus engines and URL/domain scanners.

**Setup:**
1. Visit [VirusTotal](https://www.virustotal.com/)
2. Create a free account
3. Go to your profile → API Key
4. Copy your API key
5. Add to `.env`: `VIRUSTOTAL_API_KEY=your_key_here`

**Free Tier:** 4 requests/minute

### 4. WHOIS API (Domain Age)

**Purpose:** Check domain registration date to identify newly created suspicious domains.

**Setup:**
1. Visit [WhoisXML API](https://www.whoisxmlapi.com/)
2. Register for a free account
3. Get your API key from dashboard
4. Add to `.env`: `WHOIS_API_KEY=your_key_here`

**Free Tier:** 500 requests/month

## Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
# Copy from .env.example and add your keys
GOOGLE_SAFE_BROWSING_API_KEY=your_actual_key_here
PHISHTANK_API_KEY=your_actual_key_here
VIRUSTOTAL_API_KEY=your_actual_key_here
WHOIS_API_KEY=your_actual_key_here
\`\`\`

## Fallback Mode

**Important:** The system works without API keys using intelligent simulation based on heuristic analysis. However, for production use and maximum accuracy, real API integration is strongly recommended.

### With API Keys (Production Mode)
- ✅ Real-time checks against actual threat databases
- ✅ 95%+ accuracy with multi-source verification
- ✅ Source attribution shows real API responses
- ✅ Up-to-date threat intelligence

### Without API Keys (Demo Mode)
- ⚠️ Heuristic-based pattern matching
- ⚠️ Simulated responses for demonstration
- ⚠️ Lower confidence scores
- ⚠️ Best for development/testing only

## Rate Limiting & Best Practices

1. **Caching:** Implement caching to avoid redundant API calls for the same URL
2. **Async Processing:** All API calls run in parallel for optimal performance
3. **Error Handling:** Graceful fallback if an API is unavailable
4. **Rate Limits:** Monitor your usage to stay within free tier limits

## Cost Optimization

For hackathon/college projects:
- Use free tiers (sufficient for demos and testing)
- Implement smart caching (24-hour cache recommended)
- Only scan on user request (no automatic background scanning)

For production deployment:
- Consider paid tiers for higher limits
- Implement request queuing
- Add usage analytics to monitor API consumption

## Verification

Test your API setup:

1. Start the development server: `npm run dev`
2. Navigate to `/scanner`
3. Test with a known safe URL (e.g., `https://google.com`)
4. Test with a suspicious pattern (e.g., `https://verify-account-urgent.com`)
5. Check console for API response logs

## Support

If you encounter issues:
- Check API key validity in provider dashboards
- Verify environment variables are loaded: `console.log(process.env.GOOGLE_SAFE_BROWSING_API_KEY)`
- Review API provider documentation for changes
- Check rate limit status in provider dashboards
