// ═══════════════════════════════════════════════════════════════════════════════
//  SecureNet Dynamic Real-Time Detection Engine v3.0
//  Continuous page monitoring: DOM, behavior, network, risk scoring
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';
    if (window.__securenet_rtengine) return;
    window.__securenet_rtengine = true;

    // ── Config ──────────────────────────────────────────────────────────────────
    const API_BASE = 'https://next-gen-cyber.vercel.app';
    const SECURENET_EP = API_BASE + '/api/securenet';
    const BATCH_WINDOW = 500;       // 500ms mutation batch
    const DEBOUNCE_SCAN = 4000;     // 4s between backend scans
    const POPUP_SAFE_MS = 4000;
    const POPUP_WARN_MS = 8000;
    const POPUP_DANGER_MS = 15000;

    const SKIP_RE = /^(chrome|chrome-extension|moz-extension|edge|about|file|data|blob|javascript):/;
    const SKIP_HOSTS = new Set(['newtab', 'extensions', 'settings', 'next-gen-cyber.vercel.app']);

    function skipUrl(u) {
        if (!u || SKIP_RE.test(u)) return true;
        try { return SKIP_HOSTS.has(new URL(u).hostname); } catch { return true; }
    }

    // ── State ───────────────────────────────────────────────────────────────────
    let popupHost = null, shadow = null;
    let lastBackendScan = 0, lastBackendUrl = '';
    let backendScanning = false;

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 1  REAL-TIME RISK SCORE ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    const riskState = {
        url: 0,            // from backend scan
        dom: 0,            // from DOM monitoring
        behavior: 0,       // from heuristic detection
        network: 0,        // from fetch/XHR interception
        _alerts: [],       // accumulated alert messages
        _level: 'safe',    // safe | suspicious | malicious
    };

    function computeLevel() {
        const total = riskState.url + riskState.dom + riskState.behavior + riskState.network;
        if (total >= 70) return 'malicious';
        if (total >= 35) return 'suspicious';
        return 'safe';
    }

    function addRisk(category, points, reason) {
        riskState[category] = Math.min(100, (riskState[category] || 0) + points);
        if (reason && !riskState._alerts.includes(reason)) {
            riskState._alerts.push(reason);
        }
        const newLevel = computeLevel();
        // Only escalate, never downgrade during a session
        const levels = ['safe', 'suspicious', 'malicious'];
        if (levels.indexOf(newLevel) > levels.indexOf(riskState._level)) {
            riskState._level = newLevel;
            showRiskPopup();
        }
    }

    function totalRisk() {
        return Math.min(100, riskState.url + riskState.dom + riskState.behavior + riskState.network);
    }

    function showRiskPopup() {
        const score = (totalRisk() / 10).toFixed(1);
        const reasons = riskState._alerts.slice(-5);

        if (riskState._level === 'safe') {
            showPopup({
                level: 'safe', title: 'Scan Complete — Page Appears Safe',
                message: 'No critical security issues detected.', score: null
            });
        } else if (riskState._level === 'suspicious') {
            showPopup({
                level: 'suspicious', title: 'Warning: Suspicious Activity Detected',
                message: `Live risk score: ${score}/10. Potential security concerns found.`,
                score, reasons
            });
        } else {
            showPopup({
                level: 'malicious', title: 'Danger: Threats Detected on This Page',
                message: `Critical risk score: ${score}/10. This page may be harmful.`,
                score, reasons
            });
        }

        // Send to background for badge
        try {
            chrome.runtime.sendMessage({
                action: 'securenet_scan_complete', result: {
                    summary: {
                        overall_risk: riskState._level.toUpperCase(), max_cvss: totalRisk() / 10,
                        severity_counts: {
                            critical: riskState._level === 'malicious' ? 3 : 0,
                            high: riskState._level === 'suspicious' ? 2 : 0, medium: 0, low: 0, info: 0
                        },
                        total_findings: riskState._alerts.length
                    }
                }
            });
        } catch { }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 2  SHADOW DOM POPUP SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    function ensureShadow() {
        if (popupHost && document.body.contains(popupHost)) return;
        popupHost = document.createElement('div');
        popupHost.id = 'sn-rt-host';
        popupHost.style.cssText = 'all:initial;position:fixed;top:0;right:0;z-index:2147483647;pointer-events:none;';
        shadow = popupHost.attachShadow({ mode: 'closed' });
        document.body.appendChild(popupHost);
    }

    function removePopup() { if (shadow) { const p = shadow.querySelector('.sn-p'); if (p) p.remove(); } }

    function showPopup({ level, title, message, score, reasons }) {
        if (!document.body) return;
        ensureShadow(); removePopup();
        const C = {
            safe: { bg: '#0a1a0f', bd: '#22c55e', ac: '#4ade80', gl: 'rgba(34,197,94,0.3)', ic: '🛡️' },
            suspicious: { bg: '#1a1500', bd: '#f59e0b', ac: '#fbbf24', gl: 'rgba(245,158,11,0.3)', ic: '⚠️' },
            malicious: { bg: '#1a0a0a', bd: '#ef4444', ac: '#f87171', gl: 'rgba(239,68,68,0.4)', ic: '🚨' },
        }[level] || { bg: '#0a1a0f', bd: '#22c55e', ac: '#4ade80', gl: 'rgba(34,197,94,0.3)', ic: '🛡️' };

        let btns = '';
        if (level === 'suspicious') btns = `<div class="sn-a"><button class="sn-b sn-bd">View Details</button></div>`;
        if (level === 'malicious') btns = `<div class="sn-a"><button class="sn-b sn-bl">Leave Page</button><button class="sn-b sn-bo">View Report</button></div>`;

        const scoreH = score ? `<div class="sn-sc">Risk Score: <strong>${score}</strong>/10</div>` : '';
        const reasonH = reasons && reasons.length ? `<div class="sn-rs">${reasons.slice(0, 3).map(r => `<div class="sn-r">• ${r}</div>`).join('')}</div>` : '';
        const dur = level === 'safe' ? POPUP_SAFE_MS : level === 'malicious' ? POPUP_DANGER_MS : POPUP_WARN_MS;

        const el = document.createElement('div');
        el.className = 'sn-p';
        el.innerHTML = `
      <style>
        :host{all:initial}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .sn-p{position:fixed;top:20px;right:20px;width:370px;background:${C.bg};border:1.5px solid ${C.bd};
          border-radius:16px;box-shadow:0 0 30px ${C.gl},0 20px 50px rgba(0,0,0,.5);
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#e2e8f0;
          overflow:hidden;pointer-events:auto;opacity:0;transform:translateX(120%) scale(.9);
          transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);
          z-index:2147483647;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .sn-p.vis{opacity:1;transform:translateX(0) scale(1)}
        .sn-p.hid{opacity:0;transform:translateX(80px) scale(.95);transition:opacity .4s ease-in,transform .4s ease-in}
        .sn-h{display:flex;align-items:center;gap:12px;padding:16px 18px 10px}
        .sn-ic{font-size:28px;line-height:1;flex-shrink:0}
        .sn-tw{flex:1}.sn-t{font-size:15px;font-weight:700;color:${C.ac};line-height:1.2}
        .sn-st{font-size:12px;color:#94a3b8;margin-top:2px}
        .sn-x{background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;padding:4px;border-radius:6px;transition:all .2s}
        .sn-x:hover{color:#e2e8f0;background:rgba(255,255,255,.1)}
        .sn-bd2{padding:0 18px 14px}.sn-m{font-size:13px;color:#cbd5e1;line-height:1.5}
        .sn-sc{font-size:13px;color:${C.ac};margin-top:8px;padding:6px 10px;background:rgba(255,255,255,.05);border-radius:8px;display:inline-block}
        .sn-rs{margin-top:8px;font-size:12px;color:#94a3b8}.sn-r{padding:2px 0}
        .sn-a{display:flex;gap:8px;padding:0 18px 16px}
        .sn-b{flex:1;padding:10px 16px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
        .sn-b:hover{filter:brightness(1.15);transform:translateY(-1px)}.sn-b:active{transform:translateY(0)}
        .sn-bd{background:linear-gradient(135deg,${C.bd},${C.ac});color:#000}
        .sn-bl{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}
        .sn-bo{background:transparent;border:1px solid ${C.bd};color:${C.ac}}
        .sn-pg{height:3px;background:rgba(255,255,255,.05);overflow:hidden}
        .sn-pb{height:100%;background:${C.ac};transition:width linear}
      </style>
      <div class="sn-h">
        <span class="sn-ic">${C.ic}</span>
        <div class="sn-tw"><div class="sn-t">${title}</div><div class="sn-st">SecureNet Real-Time Engine</div></div>
        <button class="sn-x" title="Dismiss">×</button>
      </div>
      <div class="sn-bd2">
        <div class="sn-m">${message}</div>${scoreH}${reasonH}
      </div>
      ${btns}
      <div class="sn-pg"><div class="sn-pb" style="width:100%"></div></div>`;

        shadow.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('vis')));

        const bar = el.querySelector('.sn-pb');
        if (bar) { bar.style.transitionDuration = dur + 'ms'; requestAnimationFrame(() => bar.style.width = '0%'); }

        let timer = null;
        const dismiss = () => { el.classList.remove('vis'); el.classList.add('hid'); setTimeout(() => { if (el.parentNode) el.remove(); }, 500); };
        if (level !== 'malicious') timer = setTimeout(dismiss, dur);
        el.querySelector('.sn-x').addEventListener('click', () => { if (timer) clearTimeout(timer); dismiss(); });
        const db = el.querySelector('.sn-bd'); if (db) db.addEventListener('click', () => {
            if (timer) clearTimeout(timer);
            try { chrome.runtime.sendMessage({ action: 'open_securenet_panel' }); } catch { window.open(API_BASE + '/securenet', '_blank'); }
            dismiss();
        });
        const lb = el.querySelector('.sn-bl'); if (lb) lb.addEventListener('click', () => { window.location.href = 'about:blank'; });
        const ob = el.querySelector('.sn-bo'); if (ob) ob.addEventListener('click', () => {
            try { chrome.runtime.sendMessage({ action: 'open_securenet_panel' }); } catch { window.open(API_BASE + '/securenet', '_blank'); }
            dismiss();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 3  CONTINUOUS DOM MONITORING (MutationObserver)
    // ═══════════════════════════════════════════════════════════════════════════

    let mutationBatch = [];
    let batchTimer = null;

    function startDOMMonitor() {
        if (!document.body) { setTimeout(startDOMMonitor, 200); return; }

        const observer = new MutationObserver((mutations) => {
            let urgent = false;

            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    const tag = node.tagName;

                    // ── Injected scripts ──
                    if (tag === 'SCRIPT') {
                        const src = node.src || '';
                        const inline = node.textContent || '';
                        if (src && isExternalSuspicious(src)) {
                            addRisk('dom', 25, `Suspicious script injected: ${new URL(src).hostname}`);
                            urgent = true;
                        }
                        if (inline.length > 100 && hasObfuscation(inline)) {
                            addRisk('dom', 20, 'Obfuscated inline script injected at runtime');
                            urgent = true;
                        }
                    }

                    // ── Injected iframes ──
                    if (tag === 'IFRAME') {
                        const src = node.src || '';
                        const style = node.getAttribute('style') || '';
                        if (/display\s*:\s*none|width\s*:\s*0|height\s*:\s*0|visibility\s*:\s*hidden/i.test(style)) {
                            addRisk('dom', 30, 'Hidden iframe injected dynamically');
                            urgent = true;
                        } else if (src && isExternalSuspicious(src)) {
                            addRisk('dom', 20, `Suspicious iframe injected: ${truncate(src, 60)}`);
                        }
                    }

                    // ── New forms / password fields ──
                    if (tag === 'FORM' || node.querySelector?.('form')) {
                        const forms = tag === 'FORM' ? [node] : Array.from(node.querySelectorAll('form'));
                        for (const form of forms) {
                            checkFormSecurity(form);
                        }
                    }
                    if (tag === 'INPUT' && node.type === 'password') {
                        addRisk('dom', 15, 'Password input field injected dynamically');
                    }
                    if (node.querySelector?.('input[type="password"]')) {
                        addRisk('dom', 15, 'Password input field injected dynamically');
                    }

                    // ── Full-screen overlays (phishing kits) ──
                    if (tag === 'DIV' || tag === 'SECTION') {
                        const cs = node.style;
                        if (cs.position === 'fixed' && cs.zIndex && parseInt(cs.zIndex) > 9999) {
                            const rect = node.getBoundingClientRect?.();
                            if (rect && rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
                                // Check if it contains login elements
                                if (node.querySelector('input[type="password"], input[type="email"], input[type="text"]')) {
                                    addRisk('dom', 35, 'Full-screen login overlay injected (phishing indicator)');
                                    urgent = true;
                                }
                            }
                        }
                    }
                }

                // ── Form action URL changes ──
                if (m.type === 'attributes' && m.attributeName === 'action' && m.target instanceof HTMLFormElement) {
                    checkFormSecurity(m.target);
                }
            }

            if (urgent) {
                flushBatch();
            } else {
                mutationBatch.push(Date.now());
                if (!batchTimer) {
                    batchTimer = setTimeout(flushBatch, BATCH_WINDOW);
                }
            }
        });

        observer.observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['action', 'src', 'href', 'style']
        });

        // Initial DOM scan
        scanExistingDOM();
    }

    function flushBatch() {
        batchTimer = null;
        mutationBatch = [];
    }

    function scanExistingDOM() {
        // Check all existing forms
        document.querySelectorAll('form').forEach(checkFormSecurity);

        // Check for password fields
        const pwFields = document.querySelectorAll('input[type="password"]');
        if (pwFields.length > 0) {
            // Password fields at load are normal — but check form action
            pwFields.forEach(pw => {
                const form = pw.closest('form');
                if (form) checkFormSecurity(form);
            });
        }

        // Check for hidden iframes
        document.querySelectorAll('iframe').forEach(iframe => {
            const style = (iframe.getAttribute('style') || '') + ' ' + getComputedStyle(iframe).cssText;
            if (/display:\s*none|width:\s*0|height:\s*0/i.test(style)) {
                addRisk('dom', 15, 'Hidden iframe present on page');
            }
        });

        // Check existing scripts for obfuscation
        document.querySelectorAll('script:not([src])').forEach(s => {
            const code = s.textContent || '';
            if (code.length > 500 && hasObfuscation(code)) {
                addRisk('dom', 10, 'Heavily obfuscated inline script detected');
            }
        });
    }

    function checkFormSecurity(form) {
        const action = form.action || form.getAttribute('action') || '';
        if (!action || action === '' || action === '#') return;

        try {
            const actionHost = new URL(action, window.location.href).hostname;
            const pageHost = window.location.hostname;
            if (actionHost !== pageHost && !actionHost.endsWith('.' + pageHost) && !pageHost.endsWith('.' + actionHost)) {
                // Cross-domain form submission
                const hasPw = !!form.querySelector('input[type="password"]');
                if (hasPw) {
                    addRisk('dom', 40, `Login form submits credentials to external domain: ${actionHost}`);
                } else {
                    addRisk('dom', 10, `Form submits to external domain: ${actionHost}`);
                }
            }
            // HTTP form on HTTPS page
            if (window.location.protocol === 'https:' && action.startsWith('http://')) {
                addRisk('dom', 20, 'Form submits data over insecure HTTP connection');
            }
        } catch { }
    }

    function isExternalSuspicious(src) {
        try {
            const host = new URL(src).hostname;
            const pageHost = window.location.hostname;
            if (host === pageHost) return false;
            // Suspicious TLDs
            if (/\.(xyz|tk|cf|ga|ml|click|download|loan|work|racing|top|club|science|review|stream|gq|bid)$/i.test(host)) return true;
            // Very short / numeric domains
            if (host.length < 5 || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return true;
            return false;
        } catch { return false; }
    }

    function hasObfuscation(code) {
        let score = 0;
        if ((code.match(/\\x[0-9a-f]{2}/gi) || []).length > 10) score += 3;
        if ((code.match(/\\u[0-9a-f]{4}/gi) || []).length > 10) score += 3;
        if ((code.match(/\batob\s*\(/g) || []).length > 2) score += 2;
        if ((code.match(/\beval\s*\(/g) || []).length > 1) score += 3;
        if ((code.match(/String\.fromCharCode/g) || []).length > 3) score += 3;
        if ((code.match(/\bcharAt\b/g) || []).length > 5) score += 1;
        if (/\['\\x/.test(code)) score += 2;
        // Very long single lines (packed/minified malware)
        const lines = code.split('\n');
        if (lines.some(l => l.length > 5000)) score += 2;
        return score >= 5;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 4  BEHAVIORAL HEURISTIC DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    function startBehaviorMonitor() {
        // ── Keystroke capture detection ──
        let keystrokeListenerCount = 0;
        const origAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, fn, opts) {
            if ((type === 'keydown' || type === 'keypress' || type === 'keyup') && this instanceof HTMLInputElement) {
                keystrokeListenerCount++;
                if (keystrokeListenerCount > 10) {
                    addRisk('behavior', 15, 'Excessive keystroke listeners on input fields');
                }
            }
            return origAddEventListener.call(this, type, fn, opts);
        };

        // ── Clipboard access detection ──
        const origExecCommand = document.execCommand?.bind(document);
        if (origExecCommand) {
            document.execCommand = function (cmd) {
                if (cmd === 'copy' || cmd === 'paste') {
                    addRisk('behavior', 10, `Clipboard access detected: ${cmd}`);
                }
                return origExecCommand(cmd);
            };
        }

        // Check navigator.clipboard usage via proxy
        if (navigator.clipboard) {
            const origRead = navigator.clipboard.readText?.bind(navigator.clipboard);
            if (origRead) {
                navigator.clipboard.readText = function () {
                    addRisk('behavior', 20, 'Page attempted to read clipboard content');
                    return origRead();
                };
            }
        }

        // ── Auto-redirect detection ──
        let redirectCount = 0;
        const origAssign = window.location.assign?.bind(window.location);
        const origReplace = window.location.replace?.bind(window.location);

        // Monitor location changes via setter
        let currentHref = window.location.href;
        setInterval(() => {
            if (window.location.href !== currentHref) {
                redirectCount++;
                currentHref = window.location.href;
                if (redirectCount > 2) {
                    addRisk('behavior', 15, `Multiple auto-redirects detected (${redirectCount})`);
                }
            }
        }, 1000);

        // ── window.open spam detection ──
        let popupCount = 0;
        const origOpen = window.open;
        window.open = function (...args) {
            popupCount++;
            if (popupCount > 2) {
                addRisk('behavior', 15, `Excessive popup windows (${popupCount})`);
            }
            return origOpen.apply(this, args);
        };

        // ── Base64 script detection in DOM ──
        setTimeout(() => {
            const allScripts = document.querySelectorAll('script:not([src])');
            allScripts.forEach(s => {
                const code = s.textContent || '';
                // Detect base64 encoded payloads being decoded
                const b64Matches = code.match(/atob\s*\(\s*['"`]([A-Za-z0-9+/=]{20,})['"`]\s*\)/g);
                if (b64Matches && b64Matches.length >= 2) {
                    addRisk('behavior', 15, 'Multiple Base64-encoded script payloads detected');
                }
            });
        }, 2000);

        // ── Detect rapid form submission attempts ──
        let formSubmitCount = 0;
        document.addEventListener('submit', () => {
            formSubmitCount++;
            if (formSubmitCount > 5) {
                addRisk('behavior', 10, 'Excessive form submissions detected');
            }
        }, true);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 5  NETWORK MONITORING (fetch/XHR Wrapper)
    // ═══════════════════════════════════════════════════════════════════════════

    function startNetworkMonitor() {
        const pageHost = window.location.hostname;
        const suspiciousEndpoints = /password|credential|login|auth|token|session|cc|card|ssn|social/i;

        // ── Wrap fetch() ──
        const origFetch = window.fetch;
        window.fetch = async function (input, init) {
            try {
                const url = typeof input === 'string' ? input : input?.url || '';
                const method = (init?.method || 'GET').toUpperCase();
                const body = init?.body || '';

                checkNetworkRequest(url, method, body, 'fetch');
            } catch { }
            return origFetch.apply(this, arguments);
        };

        // ── Wrap XMLHttpRequest ──
        const origXHROpen = XMLHttpRequest.prototype.open;
        const origXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this._snMethod = method;
            this._snUrl = url;
            return origXHROpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function (body) {
            try {
                checkNetworkRequest(this._snUrl || '', this._snMethod || 'GET', body || '', 'xhr');
            } catch { }
            return origXHRSend.apply(this, arguments);
        };

        function checkNetworkRequest(url, method, body, type) {
            if (!url) return;
            try {
                const reqUrl = new URL(url, window.location.href);
                const reqHost = reqUrl.hostname;

                // Cross-origin POST with sensitive data
                if (method === 'POST' && reqHost !== pageHost) {
                    const bodyStr = typeof body === 'string' ? body : '';
                    if (suspiciousEndpoints.test(url) || suspiciousEndpoints.test(bodyStr)) {
                        addRisk('network', 25, `Credentials posted to external domain: ${reqHost}`);
                    } else {
                        // Any cross-origin POST is worth noting
                        addRisk('network', 5, `Cross-origin POST to: ${reqHost}`);
                    }
                }

                // Requests to suspicious TLDs
                if (isExternalSuspicious(url) && method === 'POST') {
                    addRisk('network', 20, `Data sent to suspicious domain: ${reqHost}`);
                }

                // Exfiltration patterns: very long query strings or encoded data
                if (reqUrl.search.length > 2000 && reqHost !== pageHost) {
                    addRisk('network', 15, `Possible data exfiltration via long query string to ${reqHost}`);
                }

            } catch { }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 6  BACKEND SECURENET SSE SCAN
    // ═══════════════════════════════════════════════════════════════════════════

    async function runBackendScan(url) {
        if (backendScanning) return;
        const now = Date.now();
        if (url === lastBackendUrl && (now - lastBackendScan) < DEBOUNCE_SCAN) return;
        backendScanning = true;
        lastBackendUrl = url;
        lastBackendScan = now;

        try {
            // Use the original fetch (not our wrapped version)
            const origFetch = window.__sn_origFetch || window.fetch;
            const response = await origFetch(SECURENET_EP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok || !response.body) { backendScanning = false; return; }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let scanResult = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const chunks = buffer.split('\n\n');
                buffer = chunks.pop() || '';
                for (const chunk of chunks) {
                    const line = chunk.trim();
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'complete') scanResult = data;
                    } catch { }
                }
            }

            backendScanning = false;

            if (scanResult) {
                // Feed backend results into risk engine
                const summary = scanResult.summary || {};
                const maxCvss = summary.max_cvss || 0;
                riskState.url = Math.min(100, maxCvss * 10);

                // Extract alert reasons from findings
                const findings = scanResult.findings || [];
                findings.filter(f => f.severity === 'critical' || f.severity === 'high')
                    .slice(0, 5)
                    .forEach(f => {
                        if (!riskState._alerts.includes(f.title)) riskState._alerts.push(f.title);
                    });

                const newLevel = computeLevel();
                const levels = ['safe', 'suspicious', 'malicious'];
                if (levels.indexOf(newLevel) >= levels.indexOf(riskState._level)) {
                    riskState._level = newLevel;
                    showRiskPopup();
                }
            }
        } catch {
            backendScanning = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 7  EMAIL DYNAMIC MONITORING (Gmail / Outlook)
    // ═══════════════════════════════════════════════════════════════════════════

    const isEmailSite = /mail\.google\.com|outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com/i.test(window.location.hostname);

    function startEmailMonitor() {
        if (!isEmailSite) return;

        const scannedLinks = new Set();
        let emailDebounce = null;

        const emailObserver = new MutationObserver(() => {
            if (emailDebounce) clearTimeout(emailDebounce);
            emailDebounce = setTimeout(scanEmailContent, 1500);
        });

        function scanEmailContent() {
            // Gmail: .a3s.aiL  |  Outlook: .ReadMsgBody, [role="main"]
            const emailBodies = document.querySelectorAll('.a3s.aiL, .ReadMsgBody, .RpC6Td, [data-testid="message-view-body"]');

            emailBodies.forEach(body => {
                const links = Array.from(body.querySelectorAll('a[href]'));

                links.forEach(a => {
                    const href = a.href;
                    const text = (a.textContent || '').trim();
                    if (scannedLinks.has(href)) return;
                    scannedLinks.add(href);

                    if (!href.startsWith('http')) return;

                    // ── Link text ≠ actual href ──
                    if (text.startsWith('http') && text !== href) {
                        try {
                            const textHost = new URL(text).hostname;
                            const hrefHost = new URL(href).hostname;
                            if (textHost !== hrefHost) {
                                addRisk('dom', 30, `Email link mismatch: text shows "${textHost}" but goes to "${hrefHost}"`);
                                a.style.outline = '2px solid #ef4444';
                                a.style.outlineOffset = '2px';
                            }
                        } catch { }
                    }

                    // ── Homograph domain detection ──
                    try {
                        const host = new URL(href).hostname;
                        if (/xn--/.test(host) || /[\u0400-\u04FF\u0500-\u052F\u0370-\u03FF]/.test(host)) {
                            addRisk('dom', 25, `Homograph domain detected in email link: ${host}`);
                            a.style.outline = '2px solid #f59e0b';
                        }
                    } catch { }

                    // ── Suspicious redirect URLs ──
                    if (/\bredirect\b.*?url=/i.test(href) || /\bgoto\b.*?url=/i.test(href)) {
                        addRisk('dom', 10, `Email link uses redirect: ${truncate(href, 80)}`);
                    }
                });

                // ── Tracking pixels ──
                const imgs = body.querySelectorAll('img');
                let trackerCount = 0;
                imgs.forEach(img => {
                    const src = img.src || '';
                    if ((img.width <= 1 || img.height <= 1 || img.naturalWidth <= 1 || img.naturalHeight <= 1) && src.startsWith('http')) {
                        trackerCount++;
                    }
                });
                if (trackerCount > 3) {
                    addRisk('dom', 5, `${trackerCount} tracking pixels detected in email`);
                }
            });
        }

        if (document.body) {
            emailObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 8  SPA NAVIGATION DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    function startSPAMonitor() {
        let currentUrl = window.location.href;

        const origPush = history.pushState;
        history.pushState = function () {
            origPush.apply(this, arguments);
            onNavigate();
        };
        const origReplace = history.replaceState;
        history.replaceState = function () {
            origReplace.apply(this, arguments);
            onNavigate();
        };
        window.addEventListener('popstate', onNavigate);

        function onNavigate() {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                currentUrl = newUrl;
                // Reset risk for new "page"
                riskState.dom = 0;
                riskState.behavior = 0;
                riskState.network = 0;
                riskState.url = 0;
                riskState._alerts = [];
                riskState._level = 'safe';
                // Re-scan
                if (!skipUrl(newUrl)) {
                    runBackendScan(newUrl);
                    setTimeout(scanExistingDOM, 1000);
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 9  INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

    function init() {
        if (skipUrl(window.location.href)) return;

        // Save original fetch before wrapping
        window.__sn_origFetch = window.fetch;

        // Start all monitors
        startDOMMonitor();
        startBehaviorMonitor();
        startNetworkMonitor();
        startSPAMonitor();
        startEmailMonitor();

        // Initial backend scan
        runBackendScan(window.location.href);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    }

    // Listen for external messages
    try {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.action === 'show_scan_popup' && msg.result) {
                const summary = msg.result.summary || {};
                riskState.url = Math.min(100, (summary.max_cvss || 0) * 10);
                riskState._level = computeLevel();
                showRiskPopup();
            }
        });
    } catch { }

})();
