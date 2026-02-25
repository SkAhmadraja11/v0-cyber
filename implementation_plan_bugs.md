# Implementation Plan - Fixing Internal Bugs and Detection Logic

## Problem Statement
The user reported a linting error and requested a check for internal bugs. Preliminary analysis shows:
1. `npm run lint` fails because it's looking for a non-existent `lint` directory (unclear why, but we can fix the command).
2. Detection logic tests are failing for specific scenarios (hosting platform misuse and behavioral scoring).
3. Potential logical gaps in `enterprise-detection.ts` vs `real-detection.ts` mapping.

## Proposed Changes

### 1. Fix Lint Script
- Update `package.json` to explicitly lint the relevant directories: `app`, `components`, `lib`, `scripts`.
- This avoids Next.js guessing and failing.

### 2. Fix Detection Logic (`lib/real-detection.ts`)
- **Hosting Platform Detection**: Ensure `github.io` and others are correctly identified as hosting platforms to boost scores for brand impersonation.
- **Scoring Boosts**: Adjust the `checkMaliciousIntent` or `checkUltraStrictHeuristics` to ensure "Credential Access" patterns hit the 40+ threshold.
- **Subdomain Hijack**: Refine the relationship between `isHostingPlatform` and `brand keyword` detection.

### 3. Sync Logic (`lib/enterprise-detection.ts`)
- Ensure that the mapping between `RealDetectionResult` and `EnterpriseThreatResponse` is consistent.
- `enterprise-detection.ts` currently has some manual mapping that might be overriding or diluting the scores from `real-detection.ts`.

## Verification Plan
1. Run `npm run lint` to ensure it works.
2. Run the tests (e.g., `npx ts-node test-core-logic.ts`) to verify fixes for the failing cases in `core-logic-test-results.json`.
3. Manually verify `https://paypal-login.github.io` returns a score >= 85.
4. Manually verify `https://test-credentials-theft.com` returns a score >= 40.
