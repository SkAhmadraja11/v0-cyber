// Extension Configuration
// Update API_BASE to your deployed URL after deployment
// Example: const API_BASE = 'https://your-app-name.vercel.app';

const CONFIG = {
    API_BASE: 'https://next-gen-cyber.vercel.app',
    SCAN_ENDPOINT: '/scanner',
    SESSION_ENDPOINT: '/api/user/session'
};

// For MV3 service worker support
if (typeof self !== 'undefined') {
    self.CONFIG = CONFIG;
}
