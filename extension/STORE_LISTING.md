# Chrome Web Store Listing

## Product Details

**Name:** Phishing Detective Enterprise
**Summary:** Enterprise-grade real-time threat protection. Scans all web traffic and blocks malware instantly.
**Description:**
Phishing Detective Enterprise is your first line of defense against modern web threats. Designed for security-conscious organizations and individuals, this extension analyzes web pages in real-time to detect phishing, malware, and social engineering attacks before they can harm you.

**Key Features:**
*   **Real-Time Scanning:** Automatically analyzes every page you visit for malicious content.
*   **Deep Inspection:** Goes beyond simple blocklists by analyzing page content, structure, and hidden scripts.
*   **Visual Verdicts:** Get clear "Safe", "Suspicious", or "Malicious" verdicts instantly.
*   **Gmail Integration:** Scans emails directly within Gmail to flag suspicious links and urgent requests (requires separate permissions).
*   **Enterprise Grade:** Built for speed and privacy, with local caching to minimize network requests.
*   **Daily Quotas:** Manage your scanning limits with a built-in credit system.

**Version:** 2.1
**Category:** Privacy & Security

## Privacy Practices

**Single Purpose:** This extension's single purpose is to protect users from malicious websites by analyzing URL and page content reliability.

**Permission Justification:**
*   `activeTab`: Required to scan the current page content when the user requests a scan or when an automatic scan is triggered.
*   `scripting`: Used to safely inject warning banners into the page if a threat is detected, protecting the user from interacting with the site.
*   `storage`: Stores daily scan usage quotas and user preferences locally.
*   `notifications`: Alerts the user instantly if a high-risk threat is detected in the background.
*   `tabs`: Necessary to track tab updates and initiate scans on new navigations.
*   `sidePanel`: Provides a persistent, easy-to-access dashboard for scan results and threat details.
*   `host_permissions` (`*://*/*`): The extension needs to communicate with the security analysis engine (backend API) and scan pages on any domain the user visits.

## Data Usage
*   **Web History:** Accessed only for the purpose of ephemeral scanning. Data is not sold to third parties.
*   **User Activity:** We do not track user browsing history for advertising purposes. Analysis is strictly functional.
