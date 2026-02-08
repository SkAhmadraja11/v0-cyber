// PhiusGuard Gmail Integration
// Monitors Gmail for open emails and scans links for threats.

let checkedEmails = new WeakSet();

// Observer to detect when an email view is opened
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            checkForEmailBody();
        }
    }
});

function startObserving() {
    const target = document.body;
    if (target) {
        observer.observe(target, { childList: true, subtree: true });
    }
}

function checkForEmailBody() {
    // '.a3s' is a common class for the email body content wrapper in Gmail
    // We also look for Reading Pane containers
    const emailBodies = document.querySelectorAll('.a3s.aiL');

    emailBodies.forEach(body => {
        if (checkedEmails.has(body)) return;

        // Mark as checked to prevent infinite loops
        checkedEmails.add(body);

        scanEmailLinks(body);
    });
}

function scanEmailLinks(emailBody) {
    const links = Array.from(emailBody.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'));

    if (links.length === 0) return;

    // Send links to background for analysis
    chrome.runtime.sendMessage({
        action: 'scan_links_batch',
        links: links
    }, (response) => {
        if (response && response.threats && response.threats.length > 0) {
            injectWarning(emailBody, response.threats);
        }
    });
}

function injectWarning(emailBody, threats) {
    // Find a good place to insert. The parent of the body is usually the email container.
    const container = emailBody.closest('.nH.hx') || emailBody.closest('.gs') || emailBody.parentElement;

    if (!container || container.querySelector('.phius-gmail-alert')) return;

    const alertBox = document.createElement('div');
    alertBox.className = 'phius-gmail-alert';
    Object.assign(alertBox.style, {
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        color: '#b91c1c',
        padding: '12px 16px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontFamily: 'Google Sans, Roboto, sans-serif'
    });

    const threatCount = threats.length;
    const details = threats.map(t => t.url).join(', ');

    alertBox.innerHTML = `
        <div style="font-size: 20px;">⚠️</div>
        <div style="flex: 1;">
            <div style="font-weight: 700;">PhiusGuard Warning</div>
            <div>Detected ${threatCount} suspicious link${threatCount > 1 ? 's' : ''} in this email.</div>
        </div>
        <button style="background: transparent; border: 1px solid #b91c1c; border-radius: 4px; padding: 4px 10px; color: #b91c1c; cursor: pointer; font-weight: 600;">DISMISS</button>
    `;

    // Handle dismiss
    alertBox.querySelector('button').addEventListener('click', () => {
        alertBox.remove();
    });

    container.insertBefore(alertBox, container.firstChild);
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
} else {
    startObserving();
}
