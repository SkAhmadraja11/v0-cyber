// Background Service Worker for Phishing Detective Enterprise
// Continuously monitors navigation and scans in the background

// TODO: Replace with your production API URL
const API_ENDPOINT = 'http://localhost:3000/api/real-scan';

// Cache for scan results to avoid spamming the API
const scanCache = new Map();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        scanUrl(tabId, tab.url);
    }
});

// Initialize Side Panel Behavior
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Listen for messages from content scripts (e.g., Gmail scanner)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scan_links_batch') {
        handleBatchScan(request.links).then(sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleBatchScan(links) {
    const threats = [];

    // De-duplicate links to minimize requests
    const uniqueLinks = [...new Set(links)];

    // Using Promise.all for parallel scanning (faster user experience)
    await Promise.all(uniqueLinks.map(async (link) => {
        // Check cache first
        if (scanCache.has(link)) {
            const cached = scanCache.get(link);
            if (isThreat(cached)) threats.push({ url: link, verdict: cached.verdict });
            return;
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: link, mode: 'url' })
            });

            if (response.ok) {
                const result = await response.json();
                if (result && result.verdict) {
                    scanCache.set(link, result);
                    if (isThreat(result)) threats.push({ url: link, verdict: result.verdict });
                }
            }
        } catch (e) {
            // Silently ignore fetch failures for batch items
        }
    }));

    return { threats };
}

function isThreat(result) {
    return result.verdict === 'MALICIOUS' || result.verdict === 'HIGH_RISK';
}

async function scanUrl(tabId, url) {
    // Check cache first
    if (scanCache.has(url)) {
        updateBadge(tabId, scanCache.get(url));
        return;
    }

    try {
        // Set loading state
        chrome.action.setBadgeText({ text: '...', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#666', tabId });

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: url, mode: 'url' })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.verdict) {
            scanCache.set(url, result);
            updateBadge(tabId, result);
            handleThreat(tabId, result);
        }
    } catch (error) {
        // Silent fail in production, or simple error badge
        chrome.action.setBadgeText({ text: 'ERR', tabId });
    }
}

function updateBadge(tabId, result) {
    let text = 'SAFE';
    let color = '#00ff9d';

    if (result.verdict === 'MALICIOUS') {
        text = 'MALWARE';
        color = '#ff0055';
    } else if (result.verdict === 'HIGH_RISK') {
        text = 'RISK';
        color = '#ff0055';
    } else if (result.verdict === 'SUSPICIOUS') {
        text = 'WARN';
        color = '#ffb700';
    } else {
        text = 'OK';
    }

    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color, tabId });
}

function handleThreat(tabId, result) {
    if (result.verdict === 'MALICIOUS' || result.verdict === 'HIGH_RISK') {
        // 1. Notify the user
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'CRITICAL THREAT DETECTED',
            message: `This page is ${result.verdict}. ${result.threat_type?.[0] || 'Phishing'} detected.`,
            priority: 2
        });

        // 2. Inject content script to block view
        chrome.scripting.executeScript({
            target: { tabId },
            func: (data) => {
                try {
                    // Check if already blocked to prevent duplicates
                    if (document.getElementById('phius-block-overlay')) return;

                    const blockOverlay = document.createElement('div');
                    blockOverlay.id = 'phius-block-overlay';
                    Object.assign(blockOverlay.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#0d0d12',
                        color: '#ff0055',
                        zIndex: '2147483647', // Max Z-Index
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        textAlign: 'center'
                    });

                    blockOverlay.innerHTML = `
                        <div style="background: rgba(255,0,85,0.1); padding: 40px; border: 2px solid #ff0055; border-radius: 16px; max-width: 600px; box-shadow: 0 0 50px rgba(255,0,85,0.2);">
                            <h1 style="font-size: 3rem; margin: 0 0 20px 0; font-weight: 800;">🚫 BLOCKED</h1>
                            <h2 style="color: white; margin-bottom: 20px; font-weight: 600;">PhiusGuard blocked this unsafe site</h2>
                            <p style="color: #ccc; font-size: 1.2rem; margin-bottom: 30px; line-height: 1.5;">
                                <strong>Verdict:</strong> ${data.verdict}<br>
                                <strong>Reason:</strong> ${data.key_indicators?.[0] || 'Malicious Activity detected'}
                            </p>
                            <button id="unsafe-proceed" style="background: transparent; border: 1px solid #666; color: #888; padding: 12px 24px; cursor: pointer; border-radius: 6px; font-size: 14px; transition: all 0.2s;">
                                I understand the risks, proceed anyway
                            </button>
                        </div>
                    `;

                    document.body.appendChild(blockOverlay);
                    document.body.style.overflow = 'hidden';

                    document.getElementById('unsafe-proceed').addEventListener('click', () => {
                        blockOverlay.remove();
                        document.body.style.overflow = 'auto';
                    });

                    // Add hover effect via JS since we are using inline styles
                    const btn = document.getElementById('unsafe-proceed');
                    btn.onmouseover = () => { btn.style.borderColor = '#ccc'; btn.style.color = '#ccc'; };
                    btn.onmouseout = () => { btn.style.borderColor = '#666'; btn.style.color = '#888'; };

                } catch (e) { }
            },
            args: [result]
        });
    }
}
