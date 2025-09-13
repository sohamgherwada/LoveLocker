#!/bin/bash

# LoveLocker Deployment Script
# This script helps you deploy the LoveLocker application to Vercel

echo "🚀 LoveLocker Deployment Script"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your actual environment variables:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - GMAIL_USER"
    echo "   - GMAIL_APP_PASSWORD"
    echo ""
    echo "Press Enter when you're done editing .env.local..."
    read
fi

# Check if all required environment variables are set
echo "🔍 Checking environment variables..."

if grep -q "your_supabase_project_url_here" .env.local; then
    echo "❌ Please update SUPABASE_URL in .env.local"
    exit 1
fi

if grep -q "your_supabase_anon_key_here" .env.local; then
    echo "❌ Please update SUPABASE_ANON_KEY in .env.local"
    exit 1
fi

if grep -q "your_gmail_address@gmail.com" .env.local; then
    echo "❌ Please update GMAIL_USER in .env.local"
    exit 1
fi

if grep -q "your_gmail_app_password_here" .env.local; then
    echo "❌ Please update GMAIL_APP_PASSWORD in .env.local"
    exit 1
fi

echo "✅ Environment variables look good!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase database using the database-schema.sql file"
echo "2. Configure your environment variables in Vercel dashboard"
echo "3. Test your application"
echo ""
echo "For detailed setup instructions, see SETUP_GUIDE.md"
