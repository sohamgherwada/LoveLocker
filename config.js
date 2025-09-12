// LoveLocker Configuration
// Update these settings for your deployment

const LOVELOCKER_CONFIG = {
    // Your website URL - automatically detected for Vercel
    websiteUrl: (() => {
        // Auto-detect URL based on environment
        if (typeof window !== 'undefined') {
            // In browser - use current URL
            return window.location.origin;
        }
        // Fallback for Vercel deployment
        return 'https://love-locker.vercel.app';
    })(),
    
    // App Settings
    app: {
        name: 'LoveLocker',
        version: '1.0.0',
        checkInterval: 60 * 60 * 1000, // Check for unlockable letters every hour
        environment: 'production'
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.LOVELOCKER_CONFIG = LOVELOCKER_CONFIG;
}
