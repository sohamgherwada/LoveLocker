# 🚀 Vercel Deployment Guide for LoveLocker

This guide will help you deploy LoveLocker to Vercel in just a few minutes!

## 📋 Prerequisites

- [Vercel account](https://vercel.com) (free)
- [GitHub account](https://github.com) (free)
- EmailJS account (for email notifications)

## 🚀 Quick Deployment (5 minutes)

### Method 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LoveLocker app"
   git branch -M main
   git remote add origin https://github.com/yourusername/love-locker.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project
   - Go to Settings → Environment Variables
   - Add: `EMAILJS_PUBLIC_KEY` = your EmailJS public key
   - Redeploy

### Method 2: Deploy with Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd love-locker
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? No
   - Project name: love-locker
   - Framework: Other
   - Root directory: ./
   - Build command: (leave empty)
   - Output directory: ./

4. **Set Environment Variables:**
   ```bash
   vercel env add EMAILJS_PUBLIC_KEY
   # Enter your EmailJS public key when prompted
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration

### 1. Update Website URL

After deployment, update your config:

1. **Get your Vercel URL:**
   - Your app will be available at: `https://love-locker.vercel.app`
   - Or your custom domain if you set one up

2. **Update config.js (optional):**
   ```javascript
   // The app auto-detects the URL, but you can set a custom one
   websiteUrl: 'https://your-custom-domain.com'
   ```

### 2. EmailJS Setup

1. **Get EmailJS Public Key:**
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Sign up/login
   - Go to Account → API Keys
   - Copy your Public Key

2. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `EMAILJS_PUBLIC_KEY` = `your_actual_key_here`
   - Redeploy

### 3. Custom Domain (Optional)

1. **Add Custom Domain:**
   - In Vercel dashboard → Domains
   - Add your domain
   - Follow DNS setup instructions

2. **Update Config:**
   ```javascript
   websiteUrl: 'https://your-custom-domain.com'
   ```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAILJS_PUBLIC_KEY` | Your EmailJS public key | Yes |
| `WEBSITE_URL` | Custom domain URL | No (auto-detected) |

## 📁 Project Structure

```
love-locker/
├── index.html          # Main app
├── styles.css          # Styling
├── script.js           # App logic
├── config.js           # Configuration
├── vercel.json         # Vercel config
├── package.json        # Dependencies
├── .gitignore          # Git ignore rules
└── README.md           # Documentation
```

## 🚀 Deployment Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Vercel
npm run deploy

# Preview deployment
npm run preview
```

## 🔍 Testing Your Deployment

1. **Visit your Vercel URL**
2. **Test the app:**
   - Create two test accounts
   - Connect them using connection codes
   - Create a test letter with today's date
   - Check if email notifications work

3. **Check Console:**
   - Open browser dev tools
   - Look for any errors
   - Verify EmailJS is working

## 🐛 Troubleshooting

### Common Issues:

1. **EmailJS not working:**
   - Check environment variable is set
   - Verify EmailJS public key is correct
   - Check browser console for errors

2. **App not loading:**
   - Check Vercel deployment logs
   - Verify all files are uploaded
   - Check for JavaScript errors

3. **Custom domain not working:**
   - Check DNS settings
   - Wait for DNS propagation (up to 24 hours)
   - Verify domain is added in Vercel

### Debug Mode:

Add this to your browser console to see debug info:
```javascript
console.log('Config:', window.LOVELOCKER_CONFIG);
console.log('EmailJS:', typeof emailjs !== 'undefined');
```

## 📊 Vercel Features You Get

✅ **Global CDN**: Fast loading worldwide  
✅ **HTTPS**: Automatic SSL certificates  
✅ **Custom Domains**: Use your own domain  
✅ **Environment Variables**: Secure config  
✅ **Git Integration**: Auto-deploy on push  
✅ **Preview Deployments**: Test before going live  
✅ **Analytics**: Built-in performance monitoring  

## 🔄 Auto-Deployment

Once connected to GitHub:
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployment
- Pull requests → Creates preview deployment

## 💰 Pricing

- **Hobby Plan**: Free
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for LoveLocker

- **Pro Plan**: $20/month (if you need more)
  - 1TB bandwidth/month
  - Advanced features

## 🎉 You're Done!

Your LoveLocker app is now live on Vercel! 

**Next Steps:**
1. Test the app thoroughly
2. Set up EmailJS for notifications
3. Share with your partner
4. Create your first time capsule letter!

---

**Need Help?** Check the [Vercel Documentation](https://vercel.com/docs) or [EmailJS Setup Guide](EMAIL_SETUP.md).
