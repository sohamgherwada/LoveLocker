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
    
    // EmailJS Configuration
    emailjs: {
        serviceId: 'gmail',
        templateId: 'love_locker_notification',
        publicKey: process.env.EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY' // Use environment variable
    },
    
    // App Settings
    app: {
        name: 'LoveLocker',
        version: '1.0.0',
        checkInterval: 60 * 60 * 1000, // Check for unlockable letters every hour
        environment: process.env.NODE_ENV || 'development'
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.LOVELOCKER_CONFIG = LOVELOCKER_CONFIG;
}
