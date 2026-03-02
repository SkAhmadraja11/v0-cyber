// ═══════════════════════════════════════════════════════════════════════════════
//  SecureNet Dynamic Real-Time Detection Engine v4.0
//  Continuous page monitoring: DOM, behavior, network, risk scoring
//  Fixes: popup always shows, proper SSE fallback, isolated world compat
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';
    if (window.__securenet_rtengine) return;
    window.__securenet_rtengine = true;

    const LOG = (...a) => console.log('%c[SecureNet]', 'color:#4ade80;font-weight:bold', ...a);
    const WARN = (...a) => console.warn('%c[SecureNet]', 'color:#fbbf24;font-weight:bold', ...a);

    // ── Config ──
    const API_BASE = 'https://next-gen-cyber.vercel.app';
    const SECURENET_EP = API_BASE + '/api/securenet';
    const BATCH_WINDOW = 500;
    const DEBOUNCE_SCAN = 4000;
    const POPUP_SAFE_MS = 4500;
    const POPUP_WARN_MS = 8000;
    const POPUP_DANGER_MS = 15000;

    const SKIP_RE = /^(chrome|chrome-extension|moz-extension|edge|about|file|data|blob|javascript):/;
    const SKIP_HOSTS = new Set(['newtab', 'extensions', 'settings', 'next-gen-cyber.vercel.app']);

    function skipUrl(u) {
        if (!u || SKIP_RE.test(u)) return true;
        try { return SKIP_HOSTS.has(new URL(u).hostname); } catch { return true; }
    }

    // ── State ──
    let popupHost = null, shadow = null;
    let lastBackendScan = 0, lastBackendUrl = '';
    let backendScanning = false;
    let initialPopupShown = false;

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 1  REAL-TIME RISK SCORE ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    const riskState = {
        url: 0, dom: 0, behavior: 0, network: 0,
        _alerts: [], _level: 'safe',
    };

    function computeLevel() {
        const t = riskState.url + riskState.dom + riskState.behavior + riskState.network;
        if (t >= 70) return 'malicious';
        if (t >= 35) return 'suspicious';
        return 'safe';
    }

    function addRisk(category, points, reason) {
        riskState[category] = Math.min(100, (riskState[category] || 0) + points);
        if (reason && !riskState._alerts.includes(reason)) riskState._alerts.push(reason);
        LOG(`Risk +${points} [${category}]: ${reason} → total=${totalRisk()}`);

        const newLevel = computeLevel();
        const levels = ['safe', 'suspicious', 'malicious'];
        if (levels.indexOf(newLevel) > levels.indexOf(riskState._level)) {
            riskState._level = newLevel;
            WARN(`Risk ESCALATED → ${newLevel.toUpperCase()}`);
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

        // Badge update via background
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
        if (popupHost && document.body && document.body.contains(popupHost)) return;
        popupHost = document.createElement('div');
        popupHost.id = 'sn-rt-host';
        popupHost.style.cssText = 'all:initial;position:fixed;top:0;right:0;z-index:2147483647;pointer-events:none;width:0;height:0;';
        shadow = popupHost.attachShadow({ mode: 'closed' });
        document.body.appendChild(popupHost);
    }

    function removePopup() {
        if (!shadow) return;
        const old = shadow.querySelector('.sn-p');
        if (old) old.remove();
    }

    function showPopup({ level, title, message, score, reasons }) {
        if (!document.body) { LOG('No body, retrying popup in 500ms'); setTimeout(() => showPopup({ level, title, message, score, reasons }), 500); return; }
        LOG(`Showing popup: ${level} — "${title}"`);

        ensureShadow();
        removePopup();

        const C = {
            safe: { bg: '#0a1a0f', bd: '#22c55e', ac: '#4ade80', gl: 'rgba(34,197,94,0.3)', ic: '🛡️' },
            suspicious: { bg: '#1a1500', bd: '#f59e0b', ac: '#fbbf24', gl: 'rgba(245,158,11,0.3)', ic: '⚠️' },
            malicious: { bg: '#1a0a0a', bd: '#ef4444', ac: '#f87171', gl: 'rgba(239,68,68,0.4)', ic: '🚨' },
        }[level] || { bg: '#0a1a0f', bd: '#22c55e', ac: '#4ade80', gl: 'rgba(34,197,94,0.3)', ic: '🛡️' };

        let btns = '';
        if (level === 'suspicious') btns = '<div class="sn-a"><button class="sn-b sn-bdet">View Details</button></div>';
        if (level === 'malicious') btns = '<div class="sn-a"><button class="sn-b sn-blev">Leave Page</button><button class="sn-b sn-brpt">View Report</button></div>';

        const scoreH = score ? `<div class="sn-sc">Risk Score: <strong>${score}</strong>/10</div>` : '';
        const reasonH = reasons && reasons.length ? `<div class="sn-rs">${reasons.slice(0, 3).map(r => `<div class="sn-r">• ${r}</div>`).join('')}</div>` : '';
        const dur = level === 'safe' ? POPUP_SAFE_MS : level === 'malicious' ? POPUP_DANGER_MS : POPUP_WARN_MS;

        // Create a wrapper so styles apply properly
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
      <style>
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
        .sn-x{background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;padding:4px;line-height:1;border-radius:6px;transition:all .2s}
        .sn-x:hover{color:#e2e8f0;background:rgba(255,255,255,.1)}
        .sn-bd2{padding:0 18px 14px}.sn-m{font-size:13px;color:#cbd5e1;line-height:1.5}
        .sn-sc{font-size:13px;color:${C.ac};margin-top:8px;padding:6px 10px;background:rgba(255,255,255,.05);border-radius:8px;display:inline-block}
        .sn-rs{margin-top:8px;font-size:12px;color:#94a3b8}.sn-r{padding:2px 0}
        .sn-a{display:flex;gap:8px;padding:0 18px 16px}
        .sn-b{flex:1;padding:10px 16px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
        .sn-b:hover{filter:brightness(1.15);transform:translateY(-1px)}.sn-b:active{transform:translateY(0)}
        .sn-bdet{background:linear-gradient(135deg,${C.bd},${C.ac});color:#000}
        .sn-blev{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}
        .sn-brpt{background:transparent;border:1px solid ${C.bd};color:${C.ac}}
        .sn-pg{height:3px;background:rgba(255,255,255,.05);overflow:hidden}
        .sn-pb{height:100%;background:${C.ac};transition:width linear}
      </style>
      <div class="sn-p">
        <div class="sn-h">
          <span class="sn-ic">${C.ic}</span>
          <div class="sn-tw"><div class="sn-t">${title}</div><div class="sn-st">SecureNet Real-Time Engine</div></div>
          <button class="sn-x" title="Dismiss">×</button>
        </div>
        <div class="sn-bd2">
          <div class="sn-m">${message}</div>${scoreH}${reasonH}
        </div>
        ${btns}
        <div class="sn-pg"><div class="sn-pb" style="width:100%"></div></div>
      </div>`;

        // Append all children (style + popup div) to shadow
        while (wrapper.firstChild) shadow.appendChild(wrapper.firstChild);

        const el = shadow.querySelector('.sn-p');
        if (!el) { WARN('Popup element not found in shadow'); return; }

        // Animate in after 2 frames
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.classList.add('vis');
            LOG('Popup visible');
        }));

        // Progress bar
        const bar = el.querySelector('.sn-pb');
        if (bar) {
            bar.style.transitionDuration = dur + 'ms';
            requestAnimationFrame(() => bar.style.width = '0%');
        }

        // Auto-dismiss
        let timer = null;
        const dismiss = () => {
            el.classList.remove('vis');
            el.classList.add('hid');
            setTimeout(() => { if (el.parentNode) el.remove(); }, 500);
        };
        if (level !== 'malicious') timer = setTimeout(dismiss, dur);

        // Buttons
        const closeBtn = el.querySelector('.sn-x');
        if (closeBtn) closeBtn.addEventListener('click', () => { if (timer) clearTimeout(timer); dismiss(); });

        const detBtn = el.querySelector('.sn-bdet');
        if (detBtn) detBtn.addEventListener('click', () => {
            if (timer) clearTimeout(timer);
            try { chrome.runtime.sendMessage({ action: 'open_securenet_panel' }); } catch { window.open(API_BASE + '/securenet', '_blank'); }
            dismiss();
        });

        const levBtn = el.querySelector('.sn-blev');
        if (levBtn) levBtn.addEventListener('click', () => { window.location.href = 'about:blank'; });

        const rptBtn = el.querySelector('.sn-brpt');
        if (rptBtn) rptBtn.addEventListener('click', () => {
            try { chrome.runtime.sendMessage({ action: 'open_securenet_panel' }); } catch { window.open(API_BASE + '/securenet', '_blank'); }
            dismiss();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 3  CONTINUOUS DOM MONITORING (MutationObserver)
    // ═══════════════════════════════════════════════════════════════════════════

    let batchTimer = null;

    function startDOMMonitor() {
        if (!document.body) { setTimeout(startDOMMonitor, 300); return; }
        LOG('DOM Monitor started');

        const observer = new MutationObserver((mutations) => {
            let urgent = false;

            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    // Skip our own popup host
                    if (node.id === 'sn-rt-host') continue;
                    const tag = node.tagName;

                    // Injected scripts
                    if (tag === 'SCRIPT') {
                        const src = node.src || '';
                        const inline = node.textContent || '';
                        if (src && isExternalSuspicious(src)) {
                            try { addRisk('dom', 25, `Suspicious script injected: ${new URL(src).hostname}`); } catch { }
                            urgent = true;
                        }
                        if (inline.length > 100 && hasObfuscation(inline)) {
                            addRisk('dom', 20, 'Obfuscated inline script injected at runtime');
                            urgent = true;
                        }
                    }

                    // Injected iframes
                    if (tag === 'IFRAME') {
                        const src = node.src || '';
                        const style = node.getAttribute('style') || '';
                        if (/display\s*:\s*none|width\s*:\s*0|height\s*:\s*0|visibility\s*:\s*hidden/i.test(style)) {
                            addRisk('dom', 30, 'Hidden iframe injected dynamically');
                            urgent = true;
                        } else if (src && isExternalSuspicious(src)) {
                            addRisk('dom', 20, `Suspicious iframe: ${truncate(src, 60)}`);
                        }
                    }

                    // New forms / password fields
                    if (tag === 'FORM' || node.querySelector?.('form')) {
                        const forms = tag === 'FORM' ? [node] : Array.from(node.querySelectorAll('form'));
                        forms.forEach(checkFormSecurity);
                    }
                    if ((tag === 'INPUT' && node.type === 'password') || node.querySelector?.('input[type="password"]')) {
                        addRisk('dom', 15, 'Password input field injected dynamically');
                    }

                    // Full-screen overlays (phishing kits)
                    if (tag === 'DIV' || tag === 'SECTION') {
                        try {
                            const cs = getComputedStyle(node);
                            if (cs.position === 'fixed' && parseInt(cs.zIndex) > 9999) {
                                const rect = node.getBoundingClientRect();
                                if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
                                    if (node.querySelector('input[type="password"], input[type="email"], input[type="text"]')) {
                                        addRisk('dom', 35, 'Full-screen login overlay injected (phishing indicator)');
                                        urgent = true;
                                    }
                                }
                            }
                        } catch { }
                    }
                }

                // Form action URL changes
                if (m.type === 'attributes' && m.attributeName === 'action' && m.target instanceof HTMLFormElement) {
                    checkFormSecurity(m.target);
                }
            }

            if (urgent) { if (batchTimer) { clearTimeout(batchTimer); batchTimer = null; } }
            else if (!batchTimer) { batchTimer = setTimeout(() => { batchTimer = null; }, BATCH_WINDOW); }
        });

        observer.observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['action', 'src', 'href', 'style']
        });

        // Initial scan of existing DOM
        scanExistingDOM();
    }

    function scanExistingDOM() {
        document.querySelectorAll('form').forEach(checkFormSecurity);

        document.querySelectorAll('input[type="password"]').forEach(pw => {
            const form = pw.closest('form');
            if (form) checkFormSecurity(form);
        });

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const style = (iframe.getAttribute('style') || '') + ' ' + getComputedStyle(iframe).cssText;
                if (/display:\s*none|width:\s*0|height:\s*0/i.test(style)) {
                    addRisk('dom', 15, 'Hidden iframe present on page');
                }
            } catch { }
        });

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
                const hasPw = !!form.querySelector('input[type="password"]');
                if (hasPw) addRisk('dom', 40, `Login form submits to external: ${actionHost}`);
                else addRisk('dom', 10, `Form submits to external: ${actionHost}`);
            }
            if (window.location.protocol === 'https:' && action.startsWith('http://')) {
                addRisk('dom', 20, 'Form submits over insecure HTTP');
            }
        } catch { }
    }

    function isExternalSuspicious(src) {
        try {
            const host = new URL(src).hostname;
            if (host === window.location.hostname) return false;
            if (/\.(xyz|tk|cf|ga|ml|click|download|loan|work|racing|top|club|science|review|stream|gq|bid)$/i.test(host)) return true;
            if (host.length < 5 || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return true;
        } catch { }
        return false;
    }

    function hasObfuscation(code) {
        let s = 0;
        if ((code.match(/\\x[0-9a-f]{2}/gi) || []).length > 10) s += 3;
        if ((code.match(/\\u[0-9a-f]{4}/gi) || []).length > 10) s += 3;
        if ((code.match(/\batob\s*\(/g) || []).length > 2) s += 2;
        if ((code.match(/\beval\s*\(/g) || []).length > 1) s += 3;
        if ((code.match(/String\.fromCharCode/g) || []).length > 3) s += 3;
        if (/\['\\x/.test(code)) s += 2;
        const lines = code.split('\n');
        if (lines.some(l => l.length > 5000)) s += 2;
        return s >= 5;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 4  BEHAVIORAL HEURISTIC DETECTION (page-world safe)
    // ═══════════════════════════════════════════════════════════════════════════

    function startBehaviorMonitor() {
        LOG('Behavior Monitor started');

        // Periodic DOM checks instead of wrapping page APIs (which don't work in isolated world)
        setInterval(() => {
            // Check for base64 encoded scripts
            document.querySelectorAll('script:not([src])').forEach(s => {
                const code = s.textContent || '';
                const b64 = (code.match(/atob\s*\(\s*['"`]([A-Za-z0-9+/=]{20,})['"`]\s*\)/g) || []);
                if (b64.length >= 2) addRisk('behavior', 15, 'Multiple Base64-encoded script payloads');
            });

            // Check for data: URI scripts or srcs
            document.querySelectorAll('[src^="data:text/html"], [src^="data:application"]').forEach(() => {
                addRisk('behavior', 20, 'Data URI used to load content (potential XSS)');
            });

            // Check for javascript: URIs in links
            document.querySelectorAll('a[href^="javascript:"]').forEach(a => {
                const code = a.getAttribute('href') || '';
                if (code.length > 30) addRisk('behavior', 10, 'Long javascript: URI in link');
            });

        }, 5000);

        // Detect rapid form submission attempts
        let formSubmitCount = 0;
        document.addEventListener('submit', () => {
            formSubmitCount++;
            if (formSubmitCount > 5) addRisk('behavior', 10, 'Excessive form submissions');
        }, true);

        LOG('Behavior Monitor: periodic checks active');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 5  NETWORK MONITORING (via page-world script injection)
    // ═══════════════════════════════════════════════════════════════════════════

    function startNetworkMonitor() {
        LOG('Network Monitor started');

        // Inject a MAIN-world script to wrap fetch/XHR on the page
        try {
            const script = document.createElement('script');
            script.textContent = `
        (function(){
          if(window.__sn_net_mon) return;
          window.__sn_net_mon = true;
          var host = location.hostname;
          var susp = /password|credential|login|auth|token|session|cc|card|ssn|social/i;
          var origF = window.fetch;
          window.fetch = function(input, init) {
            try {
              var url = typeof input === 'string' ? input : (input && input.url || '');
              var method = (init && init.method || 'GET').toUpperCase();
              if (method === 'POST' && url) {
                try {
                  var rh = new URL(url, location.href).hostname;
                  if (rh !== host) {
                    window.dispatchEvent(new CustomEvent('__sn_net', {detail:{type:'fetch',url:url,host:rh,method:method}}));
                  }
                } catch(e){}
              }
            } catch(e){}
            return origF.apply(this, arguments);
          };
          var origOpen = XMLHttpRequest.prototype.open;
          var origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function(m,u){this.__snM=m;this.__snU=u;return origOpen.apply(this,arguments);};
          XMLHttpRequest.prototype.send = function(){
            try {
              var m = (this.__snM||'GET').toUpperCase();
              var u = this.__snU||'';
              if(m==='POST'&&u){
                try{var rh=new URL(u,location.href).hostname;if(rh!==host){
                  window.dispatchEvent(new CustomEvent('__sn_net',{detail:{type:'xhr',url:u,host:rh,method:m}}));
                }}catch(e){}
              }
            }catch(e){}
            return origSend.apply(this,arguments);
          };
        })();
      `;
            (document.head || document.documentElement).appendChild(script);
            script.remove();

            // Listen for events from the injected script
            window.addEventListener('__sn_net', (e) => {
                const d = e.detail;
                if (!d) return;
                LOG(`Network: ${d.method} ${d.type} to ${d.host}`);
                addRisk('network', 5, `Cross-origin ${d.method} to: ${d.host}`);
                if (isExternalSuspicious('https://' + d.host + '/')) {
                    addRisk('network', 20, `Data sent to suspicious domain: ${d.host}`);
                }
            });

            LOG('Network Monitor: page-world injection OK');
        } catch (err) {
            WARN('Network Monitor: injection failed:', err.message);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 6  BACKEND SECURENET SSE SCAN
    // ═══════════════════════════════════════════════════════════════════════════

    async function runBackendScan(url) {
        if (backendScanning) { LOG('Scan already in progress, skipping'); return; }
        const now = Date.now();
        if (url === lastBackendUrl && (now - lastBackendScan) < DEBOUNCE_SCAN) { LOG('Debounced, skipping'); return; }
        backendScanning = true;
        lastBackendUrl = url;
        lastBackendScan = now;

        LOG(`Backend scan starting for: ${url}`);

        try {
            const response = await fetch(SECURENET_EP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            LOG(`Backend response: ${response.status}`);
            if (!response.ok) { backendScanning = false; WARN(`Backend error: ${response.status}`); showSafePopupFallback(); return; }

            // Try streaming first, fallback to text
            let scanResult = null;

            try {
                const text = await response.text();
                LOG(`SSE response length: ${text.length}`);

                // Parse SSE events from text
                const events = text.split('\n\n');
                for (const event of events) {
                    const line = event.trim();
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'complete') {
                            scanResult = data;
                            LOG('Got complete event from SSE');
                        }
                    } catch { }
                }
            } catch (err) {
                WARN('SSE parse error:', err.message);
            }

            backendScanning = false;

            if (scanResult) {
                const summary = scanResult.summary || {};
                const maxCvss = summary.max_cvss || 0;
                LOG(`Scan complete: risk=${summary.overall_risk}, cvss=${maxCvss}, findings=${summary.total_findings}`);

                riskState.url = Math.min(100, maxCvss * 10);

                const findings = scanResult.findings || [];
                findings.filter(f => f.severity === 'critical' || f.severity === 'high')
                    .slice(0, 5)
                    .forEach(f => {
                        if (!riskState._alerts.includes(f.title)) riskState._alerts.push(f.title);
                    });

                // Force show popup for initial scan (even if safe)
                riskState._level = computeLevel();
                if (!initialPopupShown) {
                    initialPopupShown = true;
                    showRiskPopup();
                } else {
                    // Only show if level changed
                    showRiskPopup();
                }
            } else {
                WARN('No complete event received from backend');
                backendScanning = false;
                showSafePopupFallback();
            }
        } catch (err) {
            backendScanning = false;
            WARN('Backend scan failed:', err.message);
            showSafePopupFallback();
        }
    }

    function showSafePopupFallback() {
        if (!initialPopupShown) {
            initialPopupShown = true;
            showPopup({
                level: 'safe', title: 'SecureNet Active — Monitoring Page',
                message: 'Real-time protection is running. Monitoring for threats.', score: null
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 7  EMAIL DYNAMIC MONITORING
    // ═══════════════════════════════════════════════════════════════════════════

    const isEmailSite = /mail\.google\.com|outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com/i.test(window.location.hostname);

    function startEmailMonitor() {
        if (!isEmailSite) return;
        LOG('Email Monitor started');

        const scannedLinks = new Set();
        let emailDebounce = null;

        const emailObserver = new MutationObserver(() => {
            if (emailDebounce) clearTimeout(emailDebounce);
            emailDebounce = setTimeout(scanEmailContent, 1500);
        });

        function scanEmailContent() {
            const emailBodies = document.querySelectorAll('.a3s.aiL, .ReadMsgBody, .RpC6Td, [data-testid="message-view-body"]');
            emailBodies.forEach(body => {
                const links = Array.from(body.querySelectorAll('a[href]'));
                links.forEach(a => {
                    const href = a.href;
                    const text = (a.textContent || '').trim();
                    if (scannedLinks.has(href)) return;
                    scannedLinks.add(href);
                    if (!href.startsWith('http')) return;

                    // Link text ≠ href
                    if (text.startsWith('http') && text !== href) {
                        try {
                            const textHost = new URL(text).hostname;
                            const hrefHost = new URL(href).hostname;
                            if (textHost !== hrefHost) {
                                addRisk('dom', 30, `Email link mismatch: "${textHost}" → "${hrefHost}"`);
                                a.style.outline = '2px solid #ef4444';
                                a.style.outlineOffset = '2px';
                            }
                        } catch { }
                    }

                    // Homograph detection
                    try {
                        const host = new URL(href).hostname;
                        if (/xn--/.test(host)) addRisk('dom', 25, `Homograph domain: ${host}`);
                    } catch { }

                    // Redirect URLs
                    if (/\bredirect\b.*?url=/i.test(href)) addRisk('dom', 10, `Email redirect link`);
                });

                // Tracking pixels
                let trackers = 0;
                body.querySelectorAll('img').forEach(img => {
                    if ((img.width <= 1 || img.height <= 1) && (img.src || '').startsWith('http')) trackers++;
                });
                if (trackers > 3) addRisk('dom', 5, `${trackers} tracking pixels in email`);
            });
        }

        if (document.body) emailObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 8  SPA NAVIGATION DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    function startSPAMonitor() {
        let currentUrl = window.location.href;

        const origPush = history.pushState;
        history.pushState = function () { origPush.apply(this, arguments); onNav(); };
        const origReplace = history.replaceState;
        history.replaceState = function () { origReplace.apply(this, arguments); onNav(); };
        window.addEventListener('popstate', onNav);

        function onNav() {
            const u = window.location.href;
            if (u !== currentUrl) {
                currentUrl = u;
                LOG(`SPA navigation → ${u}`);
                riskState.dom = 0; riskState.behavior = 0; riskState.network = 0; riskState.url = 0;
                riskState._alerts = []; riskState._level = 'safe';
                initialPopupShown = false;
                if (!skipUrl(u)) { runBackendScan(u); setTimeout(scanExistingDOM, 1000); }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  § 9  INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

    function init() {
        const url = window.location.href;
        if (skipUrl(url)) { LOG(`Skipping: ${url}`); return; }

        LOG(`Engine v4.0 initializing on: ${url}`);

        startDOMMonitor();
        startBehaviorMonitor();
        startNetworkMonitor();
        startSPAMonitor();
        startEmailMonitor();

        // Initial backend scan with slight delay for page to settle
        setTimeout(() => runBackendScan(url), 2000);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    }

    // External message handler
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
