document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const urlDisplay = document.getElementById('urlDisplay');
    const resultsArea = document.getElementById('resultsArea');
    const loader = document.getElementById('loader');
    const statusBadge = document.getElementById('statusBadge');

    // Function to update URL from current tab
    function updateCurrentTab() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url) {
                urlDisplay.textContent = currentTab.url;
            }
        });
    }

    // Initial check
    updateCurrentTab();

    // Listen for tab switching to update the URL in the side panel
    chrome.tabs.onActivated.addListener(updateCurrentTab);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.active) {
            updateCurrentTab();
        }
    });

    // Daily Limit Logic
    const DAILY_LIMIT = 50; // Increased for "Real" Usage
    const RESET_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

    function updateCreditUI(used) {
        const remaining = Math.max(0, DAILY_LIMIT - used);
        const percent = (remaining / DAILY_LIMIT) * 100;

        document.getElementById('creditCount').textContent = remaining + '/' + DAILY_LIMIT;
        document.getElementById('creditFill').style.width = percent + '%';

        // Color based on remaining
        const fill = document.getElementById('creditFill');
        if (remaining <= 5) {
            fill.style.background = '#ff0055'; // Red warning
        } else if (remaining <= 10) {
            fill.style.background = '#ffb700'; // Yellow caution
        } else {
            fill.style.background = '#00f2ff'; // Cyan safe
        }

        if (remaining === 0) {
            scanBtn.disabled = true;
            scanBtn.textContent = 'LIMIT REACHED';
            document.getElementById('limitMsg').style.display = 'block';
        }
    }

    function checkLimit(callback) {
        chrome.storage.local.get(['scansUsed', 'lastReset'], (data) => {
            const now = Date.now();
            let used = data.scansUsed || 0;
            let lastReset = data.lastReset || 0;

            // Reset if more than 24h passed
            if (now - lastReset > RESET_PERIOD) {
                used = 0;
                lastReset = now;
                chrome.storage.local.set({ scansUsed: 0, lastReset: now });
            }

            updateCreditUI(used);
            callback(used, lastReset);
        });
    }

    // Initial Check
    checkLimit(() => { });

    scanBtn.addEventListener('click', async () => {
        checkLimit(async (currentUsed, lastReset) => {
            if (currentUsed >= DAILY_LIMIT) return;

            const url = urlDisplay.textContent;
            if (!url || url === 'No URL targeted') return;

            // UI State: Loading
            scanBtn.disabled = true;
            scanBtn.textContent = 'SCANNING...';
            resultsArea.style.display = 'none';
            loader.style.display = 'block';
            statusBadge.textContent = 'Analyzing';
            statusBadge.className = 'status-badge';

            try {
                // Call API
                const response = await fetch('http://localhost:3000/api/real-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (!response.ok) throw new Error('Network error');

                const data = await response.json();

                if (data.verdict) {
                    renderResults(data);

                    // Increment Usage
                    const newUsed = currentUsed + 1;
                    chrome.storage.local.set({
                        scansUsed: newUsed,
                        lastReset: (newUsed === 1 && currentUsed === 0) ? Date.now() : lastReset
                    });
                    updateCreditUI(newUsed);

                } else {
                    showError('Scan failed: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                // User friendly error
                showError('Connection failed. Is the Phishing Detective server running?');
            } finally {
                // UI State: Reset
                loader.style.display = 'none';

                // Re-check limit to set button state correctly
                checkLimit((used) => {
                    if (used < DAILY_LIMIT) {
                        scanBtn.disabled = false;
                        scanBtn.textContent = 'SCAN CURRENT TAB';
                    }
                });
            }
        });
    });

    function showError(msg) {
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `<div class="card verdict-card bg-suspicious" style="padding: 20px; text-align: center; color: white;">
            <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
            <div style="font-size: 14px;">${msg}</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Run <code>npm run dev</code> locally</div>
        </div>`;
    }

    function renderResults(result) {
        resultsArea.style.display = 'block';

        // Risk Score
        const scoreEl = document.getElementById('riskScore');
        animateScore(scoreEl, 0, result.risk_score, 1000);

        // Verdict & Styling
        const verdictEl = document.getElementById('verdict');
        const verdictCard = document.querySelector('.verdict-card');

        verdictEl.textContent = result.verdict;
        statusBadge.textContent = result.verdict;

        // Reset classes
        verdictCard.className = 'card verdict-card';
        scoreEl.className = 'risk-value';
        verdictEl.className = 'verdict-value';
        statusBadge.className = 'status-badge';

        if (result.verdict === 'SAFE') {
            verdictCard.classList.add('bg-safe');
            scoreEl.classList.add('status-safe');
            verdictEl.classList.add('status-safe');
            statusBadge.classList.add('status-safe');
            statusBadge.style.color = '#00ff9d';
            statusBadge.style.borderColor = '#00ff9d';
        } else if (result.verdict === 'SUSPICIOUS') {
            verdictCard.classList.add('bg-suspicious');
            scoreEl.classList.add('status-suspicious');
            verdictEl.classList.add('status-suspicious');
            statusBadge.classList.add('status-suspicious');
            statusBadge.style.color = '#ffb700';
            statusBadge.style.borderColor = '#ffb700';
        } else {
            verdictCard.classList.add('bg-malicious');
            scoreEl.classList.add('status-malicious');
            verdictEl.classList.add('status-malicious');
            statusBadge.classList.add('status-malicious');
            statusBadge.style.color = '#ff0055';
            statusBadge.style.borderColor = '#ff0055';
        }

        // Confidence
        document.getElementById('confidence').textContent = (result.confidence === 'VERY_HIGH' || result.confidence === 'HIGH') ?
            result.confidence : result.confidence;

        // Findings / Indicators
        const list = document.getElementById('findingsList');
        list.className = 'findings-grid';
        list.innerHTML = '';

        if (result.key_indicators && result.key_indicators.length > 0) {
            result.key_indicators.forEach(indicator => {
                const card = document.createElement('div');
                card.className = `evidence-card ${result.verdict === 'SAFE' ? 'safe' : 'detected'}`;
                card.innerHTML = `<div class="evidence-reason">${indicator}</div>`;
                list.appendChild(card);
            });
        } else {
            const empty = document.createElement('div');
            empty.className = 'evidence-card safe';
            empty.innerHTML = '<div class="evidence-reason">No specific threats detected.</div>';
            list.appendChild(empty);
        }

        // Enterprise Fields
        const threatContainer = document.getElementById('threatType');
        threatContainer.innerHTML = '';
        if (result.threat_type && result.threat_type.length > 0) {
            result.threat_type.forEach(type => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = type;
                threatContainer.appendChild(tag);
            });
        } else {
            threatContainer.textContent = 'None';
        }

        document.getElementById('userImpact').textContent = result.user_impact;
        document.getElementById('explanation').textContent = result.explanation;

        const actionEl = document.getElementById('recommendedAction');
        const actionContainer = document.getElementById('actionContainer');
        actionEl.textContent = result.recommended_action;

        // Action Styling
        actionContainer.className = 'action-banner'; // Reset
        if (result.recommended_action === 'BLOCK' || result.recommended_action === 'QUARANTINE') {
            actionContainer.classList.add('action-block');
        } else if (result.recommended_action === 'WARN') {
            actionContainer.classList.add('action-warn');
        } else {
            actionContainer.classList.add('action-allow');
        }
    }

    function animateScore(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = Math.floor(easeProgress * (end - start) + start);
            obj.textContent = current + '/100';

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
