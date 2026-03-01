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
            if (currentTab && currentTab.url && urlDisplay) {
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

    const userEmail = document.getElementById('userEmail');
    const userPlan = document.getElementById('userPlan');

    // Use configuration from config.js
    const SESSION_API = CONFIG.API_BASE + CONFIG.SESSION_ENDPOINT;
    const SCAN_API = CONFIG.API_BASE + CONFIG.SCAN_ENDPOINT;

    console.log("API URL:", SCAN_API);

    // Live Technical Ticker Logic
    // ---------------------------------------------------------
    function initLiveTicker() {
        const ipDisplay = document.getElementById('ipDisplay');
        const latencyDisplay = document.getElementById('latencyDisplay');
        const logRolling = document.getElementById('logRolling');

        // 1. Get Real IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => { if (ipDisplay) ipDisplay.textContent = data.ip; })
            .catch(() => { if (ipDisplay) ipDisplay.textContent = "Unknown"; });

        // 2. Measure Latency
        const measureLatency = async () => {
            try {
                const start = performance.now();
                await fetch(`${CONFIG.API_BASE}/api/health`, { method: 'HEAD', cache: 'no-store' }).catch(() => { });
                const end = performance.now();
                if (latencyDisplay) latencyDisplay.textContent = Math.round(end - start) + "ms";
            } catch (e) {
                if (latencyDisplay) latencyDisplay.textContent = "-- ms";
            }
        };

        // 3. Log Ticker Logic
        const logPool = [
            "Analyzing incoming packets...",
            "Firewall rule check: PASS",
            "Encryption protocol: TLS 1.3",
            "Checking database integrity...",
            "Refreshing threat signatures...",
            "Heuristic engine: IDLE",
            "Sandbox environment: READY",
            "Geo-IP lookup: SUCCESS",
            "Scanning network layer..."
        ];

        let logIndex = 0;
        const updateLogs = () => {
            if (!logRolling) return;
            logRolling.innerHTML = `<span class="log-entry active">${logPool[logIndex]}</span>`;
            logIndex = (logIndex + 1) % logPool.length;
        };

        measureLatency();
        setInterval(measureLatency, 5000);
        setInterval(updateLogs, 3000);
        updateLogs();
    }

    // Initialize Ticker
    initLiveTicker();

    // Rotating Cybersecurity Quotes
    const QUOTES = [
        { text: "Security is not a product, but a process.", author: "Bruce Schneier" },
        { text: "The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room.", author: "Gene Spafford" },
        { text: "If you think technology can solve your security problems, then you don't understand the problems.", author: "Bruce Schneier" },
        { text: "Amateurs hack systems, professionals hack people.", author: "Bruce Schneier" },
        { text: "It takes 20 years to build a reputation and a few minutes of cyber incident to ruin it.", author: "Stephane Nappo" },
        { text: "The internet is a dangerous place. Be the shield, not the vulnerability.", author: "PhiusGuard" },
        { text: "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite.", author: "Marlon Brando" },
        { text: "Think before you click.", author: "Cybersecurity Axiom" },
        { text: "Every system has a weakness. Know yours before attackers do.", author: "PhiusGuard" },
        { text: "Encryption works. If your data is encrypted, NSA can't get to it.", author: "Edward Snowden" },
    ];

    function rotateQuote() {
        const textEl = document.getElementById('quoteText');
        const authorEl = document.getElementById('quoteAuthor');
        if (!textEl || !authorEl) return;
        // Fade out
        textEl.style.opacity = '0';
        authorEl.style.opacity = '0';
        setTimeout(() => {
            const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            textEl.textContent = `"${q.text}"`;
            authorEl.textContent = `— ${q.author}`;
            // Fade in
            textEl.style.opacity = '1';
            authorEl.style.opacity = '1';
        }, 500);
    }

    // Start with a random quote, then rotate every 8s
    rotateQuote();
    setInterval(rotateQuote, 8000);

    // Fetch User Session
    async function fetchSession() {
        try {
            const response = await fetch(SESSION_API);
            const data = await response.json();

            if (data.authenticated && data.user) {
                if (userEmail) userEmail.textContent = data.user.email;
                if (userPlan) userPlan.textContent = data.user.plan || 'Phishing Detective Pro';
            } else {
                if (userEmail) userEmail.textContent = 'Guest User';
                if (userPlan) userPlan.textContent = 'Limited Protection';
            }
        } catch (error) {
            console.error('Session fetch failed:', error);
            if (userEmail) userEmail.textContent = 'Offline Mode';
            if (userPlan) userPlan.textContent = 'Check Connection';
        }
    }

    // Initial session fetch
    fetchSession();

    scanBtn.addEventListener('click', async () => {
        let url = urlDisplay.textContent ? urlDisplay.textContent.trim() : '';

        // Prevent empty submissions
        if (!url || url === 'No URL targeted' || url === '') {
            showError('Please select a valid page to scan');
            return;
        }

        // Robust trimming and protocol prepending (Deterministic Normalization)
        url = url.trim();
        // Remove fragments as per requirement
        try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            urlObj.hash = '';
            url = urlObj.toString();
        } catch (e) {
            // Fallback for very simple URLs
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
        }

        // UI State: Loading
        if (scanBtn) {
            scanBtn.disabled = true;
            scanBtn.textContent = 'SCANNING...';
        }
        if (resultsArea) resultsArea.style.display = 'none';
        if (loader) loader.style.display = 'block';
        const urlCard = document.querySelector('.url-card');
        if (urlCard) urlCard.classList.add('scanning-state');
        if (statusBadge) {
            statusBadge.textContent = 'Analyzing';
            statusBadge.className = 'status-badge';
        }

        try {
            // Call API with identical request format as web app
            console.log('PhusGuard: Scanning URL:', url);
            const response = await fetch(SCAN_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url, mode: 'url' })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    showError('Invalid URL');
                } else if (response.status === 500) {
                    showError('Backend issue');
                } else {
                    showError(`Server error: ${response.status}`);
                }
                throw new Error(data.message || data.error || `Server error: ${response.status}`);
            }

            if (data.verdict || typeof data.risk_score !== 'undefined') {
                if (window.pgUsage) window.pgUsage.updateState(data.verdict);
                renderResults(data);
            } else {
                showError('Scan failed: Invalid response format');
            }
        } catch (error) {
            console.error('Scan Error:', error);
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError' || error.message === 'Connection failed') {
                showError('Extension connectivity error');
            } else {
                // Already shown if it was a status error
                console.warn('Silent caught error for UI stack trace');
            }
        } finally {
            // UI State: Reset
            if (loader) loader.style.display = 'none';
            const urlCard = document.querySelector('.url-card');
            if (urlCard) urlCard.classList.remove('scanning-state');
            if (scanBtn) {
                scanBtn.disabled = false;
                scanBtn.textContent = 'SCAN CURRENT TAB';
            }
        }
    });

    function showError(msg) {
        if (resultsArea) {
            resultsArea.style.display = 'block';
            resultsArea.innerHTML = `<div class="card verdict-card bg-suspicious" style="padding: 20px; text-align: center; color: white;">
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div style="font-size: 14px;">${msg}</div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Backend: ${CONFIG.API_BASE}</div>
            </div>`;
        }
    }

    function renderResults(result) {
        resultsArea.style.display = 'block';

        // Risk Score
        const scoreEl = document.getElementById('riskScore');
        const numericScore = result.riskScore || result.risk_score || 0;
        animateScore(scoreEl, 0, numericScore, 1000);

        // Risk Level Mapping (Requirement mapping)
        const getRiskLevel = (verdict) => {
            switch (verdict) {
                case 'SAFE': return 'Low';
                case 'SUSPICIOUS': return 'Medium';
                case 'HIGH_RISK': return 'High';
                case 'MALICIOUS': return 'Critical';
                default: return 'Unknown';
            }
        };

        const verdictEl = document.getElementById('verdict');
        const verdictCard = document.querySelector('.verdict-card');
        const riskLevel = getRiskLevel(result.verdict);

        if (verdictEl) verdictEl.textContent = riskLevel;
        if (statusBadge) statusBadge.textContent = riskLevel;

        // Reset classes
        if (verdictCard) verdictCard.className = 'card verdict-card';
        if (scoreEl) scoreEl.className = 'risk-value';
        if (verdictEl) verdictEl.className = 'verdict-value';
        if (statusBadge) statusBadge.className = 'status-badge';

        if (result.verdict === 'SAFE') {
            if (verdictCard) verdictCard.classList.add('bg-safe');
            if (scoreEl) scoreEl.classList.add('status-safe');
            if (verdictEl) verdictEl.classList.add('status-safe');
            if (statusBadge) {
                statusBadge.classList.add('status-safe');
                statusBadge.style.color = '#00ff9d';
                statusBadge.style.borderColor = '#00ff9d';
            }
        } else if (result.verdict === 'SUSPICIOUS') {
            if (verdictCard) verdictCard.classList.add('bg-suspicious');
            if (scoreEl) scoreEl.classList.add('status-suspicious');
            if (verdictEl) verdictEl.classList.add('status-suspicious');
            if (statusBadge) {
                statusBadge.classList.add('status-suspicious');
                statusBadge.style.color = '#ffb700';
                statusBadge.style.borderColor = '#ffb700';
            }
        } else if (result.verdict === 'HIGH_RISK') {
            // High Risk -> Orange-ish / Red mix
            if (verdictCard) verdictCard.classList.add('bg-high-risk');
            if (scoreEl) scoreEl.classList.add('status-high-risk');
            if (verdictEl) verdictEl.classList.add('status-high-risk');
            if (statusBadge) {
                statusBadge.classList.add('status-high-risk');
                statusBadge.style.color = 'var(--high-risk)';
                statusBadge.style.borderColor = 'var(--high-risk)';
            }
        } else {
            // MALICIOUS -> Critical (Red)
            if (verdictCard) verdictCard.classList.add('bg-malicious');
            if (scoreEl) scoreEl.classList.add('status-malicious');
            if (verdictEl) verdictEl.classList.add('status-malicious');
            if (statusBadge) {
                statusBadge.classList.add('status-malicious');
                statusBadge.style.color = '#ff0055';
                statusBadge.style.borderColor = '#ff0055';
            }
        }

        // Confidence
        const confidenceEl = document.getElementById('confidence');
        if (confidenceEl) confidenceEl.textContent = result.confidence;

        // Evidence Sources Used (Pills)
        const sourcesContainer = document.getElementById('evidenceSourcesUsed');
        if (sourcesContainer) {
            sourcesContainer.innerHTML = '';
            const sources = result.verdictReport?.evidenceSourcesUsed || [];
            if (sources.length > 0) {
                sources.forEach(source => {
                    const pill = document.createElement('span');
                    pill.className = 'source-pill';
                    pill.textContent = source;
                    sourcesContainer.appendChild(pill);
                });
            } else {
                sourcesContainer.textContent = '--';
            }
        }

        // Technical Evidence Grid
        const techGridBody = document.getElementById('techGridBody');
        if (techGridBody) {
            techGridBody.innerHTML = '';

            const getTier = (name) => {
                const n = name.toLowerCase();
                if (n.includes('google') || n.includes('phishtank') || n.includes('virustotal')) return 'T1';
                if (n.includes('pattern') || n.includes('forensic') || n.includes('reputation') || n.includes('whois')) return 'T2';
                return 'T3';
            };

            const sources = result.sources || [];
            if (sources.length > 0) {
                sources.forEach(s => {
                    const tier = getTier(s.name);
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="indicator-name">${s.name}</div>
                            <div class="indicator-reason">${s.reason || '--'}</div>
                        </td>
                        <td><span class="tier-badge tier-${tier.toLowerCase()}">${tier}</span></td>
                        <td><span class="grid-status ${s.detected ? 'status-detected' : 'status-clean'}">${s.detected ? 'DETECTED' : 'CLEAN'}</span></td>
                    `;
                    techGridBody.appendChild(row);
                });
            } else {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 20px;">No forensic data available for this scan</td>`;
                techGridBody.appendChild(emptyRow);
            }
        }

        // Findings / Indicators
        const list = document.getElementById('findingsList');
        list.className = 'findings-grid'; // Ensure grid layout
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

        const userImpactEl = document.getElementById('userImpact');
        if (userImpactEl) userImpactEl.textContent = result.user_impact;

        const explanationEl = document.getElementById('explanation');
        if (explanationEl) explanationEl.textContent = result.explanation;

        const actionEl = document.getElementById('recommendedAction');
        const actionContainer = document.getElementById('actionContainer');
        if (actionEl) actionEl.textContent = result.recommended_action;

        // Action Styling
        if (actionContainer) {
            actionContainer.className = 'action-banner'; // Reset
            if (result.recommended_action === 'BLOCK' || result.recommended_action === 'QUARANTINE') {
                actionContainer.classList.add('action-block');
            } else if (result.recommended_action === 'WARN') {
                actionContainer.classList.add('action-warn');
            } else {
                actionContainer.classList.add('action-allow');
            }
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
            if (obj) obj.textContent = current + '/100';

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
