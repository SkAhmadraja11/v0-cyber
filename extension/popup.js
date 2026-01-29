document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const urlDisplay = document.getElementById('urlDisplay');
    const resultsArea = document.getElementById('resultsArea');
    const loader = document.getElementById('loader');
    const statusBadge = document.getElementById('statusBadge');

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
            urlDisplay.textContent = currentTab.url;
        }
    });

    // Daily Limit Logic
    const DAILY_LIMIT = 10;
    const RESET_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

    function updateCreditUI(used) {
        const remaining = Math.max(0, DAILY_LIMIT - used);
        const percent = (remaining / DAILY_LIMIT) * 100;

        document.getElementById('creditCount').textContent = remaining + '/' + DAILY_LIMIT;
        document.getElementById('creditFill').style.width = percent + '%';

        // Color based on remaining
        const fill = document.getElementById('creditFill');
        if (remaining <= 2) {
            fill.style.background = '#ff0055'; // Red warning
        } else if (remaining <= 5) {
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
                // Call Local API (In production, replace with real domain)
                const response = await fetch('http://localhost:3000/api/real-scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                const data = await response.json();

                if (data.success) {
                    renderResults(data.result);

                    // Increment Usage
                    const newUsed = currentUsed + 1;
                    chrome.storage.local.set({
                        scansUsed: newUsed,
                        lastReset: (newUsed === 1 && currentUsed === 0) ? Date.now() : lastReset // Set reset time on first scan if needed, or keep original track
                    });
                    updateCreditUI(newUsed);

                } else {
                    alert('Scan failed: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Scan Error:', error);
                alert('Connection failed. Ensure the local server is running at http://localhost:3000');
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

    function renderResults(result) {
        resultsArea.style.display = 'block';

        // Risk Score
        const scoreEl = document.getElementById('riskScore');
        animateScore(scoreEl, 0, result.riskScore, 1000);
        // scoreEl.textContent = result.riskScore + '/100'; // Handled by animateScore

        // Verdict & Styling
        // Verdict & Styling
        const verdictEl = document.getElementById('verdict');
        const verdictCard = document.querySelector('.verdict-card');

        verdictEl.textContent = result.classification;
        statusBadge.textContent = result.classification;

        // Reset classes
        verdictCard.className = 'card verdict-card';
        scoreEl.className = 'risk-value'; // Reset to base class
        verdictEl.className = 'verdict-value'; // Reset to base class

        if (result.classification === 'SAFE') {
            verdictCard.classList.add('bg-safe');
            scoreEl.classList.add('status-safe');
            verdictEl.classList.add('status-safe');
            statusBadge.classList.add('status-safe');
            statusBadge.style.color = '#00ff9d';
            statusBadge.style.borderColor = '#00ff9d';
        } else if (result.classification === 'SUSPICIOUS') {
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
        document.getElementById('confidence').textContent = result.confidence + '%';

        // Findings / Evidence
        const list = document.getElementById('findingsList');
        list.className = 'findings-grid'; // Switch to grid layout
        list.innerHTML = '';

        // If we have detailed sources, use them
        if (result.sources && result.sources.length > 0) {
            // Sort: Detected first, then by confidence
            const sortedSources = result.sources.sort((a, b) => {
                if (a.detected === b.detected) return b.confidence - a.confidence;
                return a.detected ? -1 : 1;
            });

            sortedSources.forEach(source => {
                // Skip low confidence non-detections to keep UI clean
                if (!source.detected && source.confidence < 30) return;

                const card = document.createElement('div');
                card.className = `evidence-card ${source.detected ? 'detected' : 'safe'}`;

                // Icon Selection
                let icon = '🛡️';
                if (source.name.includes('Entropy')) icon = '🧬';
                if (source.name.includes('Homoglyph')) icon = '👁️';
                if (source.name.includes('Brand')) icon = '🏢';
                if (source.name.includes('Crypto')) icon = '🪙';
                if (source.name.includes('Virus')) icon = '🦠';
                if (source.name.includes('Identity')) icon = '👤';

                card.innerHTML = `
                    <div class="evidence-header">
                        <span class="evidence-icon">${icon}</span>
                        <span class="evidence-name">${source.name}</span>
                        <span class="evidence-score">${source.confidence}%</span>
                    </div>
                    <div class="evidence-reason">${source.reason}</div>
                `;
                list.appendChild(card);
            });
        } else {
            // Fallback for simple API responses
            result.reasons.slice(0, 3).forEach(reason => {
                const li = document.createElement('div');
                li.className = 'evidence-card safe';
                li.textContent = reason;
                list.appendChild(li);
            });
        }

        if (list.children.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'evidence-card safe';
            empty.innerHTML = '<div class="evidence-reason">No specific threats detected by any engine.</div>';
            list.appendChild(empty);
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
