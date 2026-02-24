# Scanner Tuning & Non-invasive Recommendations

This document lists low-risk, non-invasive steps to improve detection accuracy and reduce misclassification without changing core detection logic.

Recommended steps (no code edits required):

- Verify and enable real API keys for external feeds:
  - Google Safe Browsing, PhishTank, VirusTotal. Ensure rate limits and cached results are handled.

- Increase live-intel weight when multiple T1 sources respond:
  - Use external consensus to escalate to MALICIOUS immediately (already present). Ensure API keys return real `isReal` flags.

- Add a curated allowlist and denylist (external JSON or DB) and load at runtime:
  - Allowlist common CDNs, corporate domains, and internal IPs.
  - Denylist known malicious domains/URL patterns maintained externally.
  - This is non-invasive: store lists in `supabase` or a config bucket and fetch at runtime.

- Tune thresholds by dataset-driven calibration:
  - Run `scripts/scan-test.ts` on labeled datasets, adjust `riskScore` mapping heuristics in a config file (not core code) to update weights.

- Reduce false positives from brand analysis:
  - Maintain a small override list of legitimate subdomain patterns (e.g., vendor sandbox or developer subdomains on free hosting) to prevent over-blocking.

- Improve URL normalization and extraction as a config toggle:
  - Allow toggling strict vs lenient normalization for user-facing scans. Keep strict mode for enterprise blocking and lenient mode for user warnings.

- Monitoring and feedback loop:
  - Log misclassifications to a review queue (`scan_results` already exists). Add a small dashboard process to review and label results; feed labels back into calibration.

Quick run instructions (developer machine):

1) Install dependencies and run with ts-node (or compile):

```bash
npx ts-node scripts/scan-test.ts
```

2) Use the sample dataset at `scripts/sample-urls.json`. Add failing examples there for calibration.

If you want, I can also add an external allowlist/denylist loader and a simple calibration script that suggests weight changes. I will not modify your detection code unless you explicitly request it.
