// PhiusGuard Global Protection
// Injects a status indicator on page load to confirm protection is active.

(function () {
    // Avoid double injection
    if (document.getElementById('phiusguard-status-indicator')) return;

    // Create the indicator container
    const indicator = document.createElement('div');
    indicator.id = 'phiusguard-status-indicator';

    // Apply styles directly to ensure isolation and look
    Object.assign(indicator.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slate-900 with slight transparency
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        zIndex: '2147483647', // Max z-index
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        opacity: '0',
        transform: 'translateY(20px) scale(0.95)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none', // Allow clicking through
        userSelect: 'none'
    });

    // Inner HTML content
    indicator.innerHTML = `
        <div style="
            width: 36px; 
            height: 36px; 
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
        ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: white;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        </div>
        <div style="display: flex; flex-direction: column;">
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; line-height: 1.2;">PhiusGuard</span>
            <span style="font-size: 13px; color: #fff; font-weight: 500; line-height: 1.2;">Protection Active</span>
        </div>
    `;

    // Wait for body to be available
    const mount = () => {
        if (document.body) {
            document.body.appendChild(indicator);

            // Animate in
            requestAnimationFrame(() => {
                indicator.style.opacity = '1';
                indicator.style.transform = 'translateY(0) scale(1)';
            });

            // Animate out after 3.5 seconds
            setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(10px) scale(0.95)';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 500);
            }, 3500);
        } else {
            // Retry if body not ready
            setTimeout(mount, 100);
        }
    };

    mount();
})();
