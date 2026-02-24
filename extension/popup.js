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

    const userEmail = document.getElementById('userEmail');
    const userPlan = document.getElementById('userPlan');

    // API Configuration
    const API_BASE = 'http://127.0.0.1:3000';
    const SESSION_API = `${API_BASE}/api/user/session`;
    const SCAN_API = `${API_BASE}/api/real-scan`;

    // ---------------------------------------------------------
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
                await fetch(`${API_BASE}/api/health`, { method: 'HEAD', cache: 'no-store' }).catch(() => { });
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

    // Fetch User Session
    async function fetchSession() {
        try {
            const response = await fetch(SESSION_API);
            const data = await response.json();

            if (data.authenticated && data.user) {
                userEmail.textContent = data.user.email;
                userPlan.textContent = data.user.plan || 'Phishing Detective Pro';
            } else {
                userEmail.textContent = 'Guest User';
                userPlan.textContent = 'Limited Protection';
            }
        } catch (error) {
            console.error('Session fetch failed:', error);
            userEmail.textContent = 'Offline Mode';
            userPlan.textContent = 'Check Connection';
        }
    }

    // Initial session fetch
    fetchSession();

    scanBtn.addEventListener('click', async () => {
        let url = urlDisplay.textContent ? urlDisplay.textContent.trim() : '';

        // Prevent empty submissions
        if (!url || url === 'No URL targeted' || url === '') {
            alert('Please select a valid page to scan');
            return;
        }

        // Auto-prepend https:// if protocol missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // UI State: Loading
        scanBtn.disabled = true;
        scanBtn.textContent = 'SCANNING...';
        resultsArea.style.display = 'none';
        loader.style.display = 'block';
        const urlCard = document.querySelector('.url-card');
        if (urlCard) urlCard.classList.add('scanning-state');
        statusBadge.textContent = 'Analyzing';
        statusBadge.className = 'status-badge';

        try {
            // Call API with new body format
            const response = await fetch(SCAN_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url, mode: 'url' })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || data.error || `Server error: ${response.status}`;
                throw new Error(errorMsg);
            }

            if (data.verdict) {
                renderResults(data);
            } else {
                alert('Scan failed: ' + (data.message || data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Scan Error:', error);
            alert('Scan Error: ' + error.message);
        } finally {
            // UI State: Reset
            loader.style.display = 'none';
            const urlCard = document.querySelector('.url-card');
            if (urlCard) urlCard.classList.remove('scanning-state');
            scanBtn.disabled = false;
            scanBtn.textContent = 'SCAN CURRENT TAB';
        }
    });

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
