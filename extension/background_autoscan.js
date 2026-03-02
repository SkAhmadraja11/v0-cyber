// SecureNet Auto-Scan — Background Companion
// Handles webNavigation events and badge updates from content script scan results

try { importScripts('config.js'); } catch { }

// ── webNavigation listener: triggers content script scan on committed navigation ──
chrome.webNavigation.onCommitted.addListener((details) => {
    // Only main frame, skip subframes
    if (details.frameId !== 0) return;
    // Skip non-http
    if (!details.url || !details.url.startsWith('http')) return;

    // The content_autoscan.js will handle the actual scan on load,
    // but we set the badge to "scanning" immediately for responsiveness
    try {
        chrome.action.setBadgeText({ text: '⏳', tabId: details.tabId }).catch(() => { });
        chrome.action.setBadgeBackgroundColor({ color: '#475569', tabId: details.tabId }).catch(() => { });
    } catch { }
});

// ── Listen for scan results from content_autoscan.js ──
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === 'securenet_scan_complete' && sender.tab) {
        const tabId = sender.tab.id;
        const summary = msg.result?.summary || {};
        const risk = summary.overall_risk || 'MINIMAL';
        const counts = summary.severity_counts || {};

        let text = '✓';
        let color = '#22c55e'; // green

        if (risk === 'CRITICAL' || (counts.critical || 0) >= 2) {
            text = '!!';
            color = '#ef4444'; // red
        } else if (risk === 'HIGH' || ((counts.critical || 0) + (counts.high || 0)) >= 2) {
            text = '!';
            color = '#f59e0b'; // yellow
        }

        try {
            chrome.action.setBadgeText({ text, tabId }).catch(() => { });
            chrome.action.setBadgeBackgroundColor({ color, tabId }).catch(() => { });
        } catch { }
    }

    // Handle request to open SecureNet panel
    if (msg.action === 'open_securenet_panel' && sender.tab) {
        try {
            chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {
                // Fallback: open in new tab
                chrome.tabs.create({ url: CONFIG.API_BASE + '/securenet' }).catch(() => { });
            });
        } catch {
            chrome.tabs.create({ url: 'https://next-gen-cyber.vercel.app/securenet' }).catch(() => { });
        }
    }
});
