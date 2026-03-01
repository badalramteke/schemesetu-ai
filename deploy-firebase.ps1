# SchemeSetu AI - Firebase Deployment Script (PowerShell)

Write-Host "🚀 SchemeSetu AI - Firebase Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>&1 | Select-Object -First 1
    Write-Host "✓ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
$nodeVersion = node -v 2>&1
Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

# Build the project
Write-Host ""
Write-Host "🔨 Building Next.js app..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path ".next")) {
    Write-Host "❌ Build failed. .next directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green

# Check authentication
Write-Host ""
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow

try {
    firebase list --json | Out-Null
    Write-Host "✓ Already authenticated with Firebase" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not authenticated. Running: firebase login" -ForegroundColor Yellow
    firebase login
}

# Show deployment options
Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Firebase Hosting (static files)"
Write-Host "2. Cloud Run (full Node.js app - recommended)"
Write-Host "3. Full Firebase deployment (hosting + functions)"
Write-Host ""

$choice = Read-Host "Choose deployment option (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📤 Deploying to Firebase Hosting..." -ForegroundColor Yellow
        firebase deploy --only hosting
    }
    "2" {
        Write-Host ""
        Write-Host "🐳 Preparing for Cloud Run deployment..." -ForegroundColor Yellow
        Write-Host "Run these commands:" -ForegroundColor Cyan
        Write-Host "docker build -t gcr.io/schemesetu-ai/schemesetu-ai ."
        Write-Host "docker push gcr.io/schemesetu-ai/schemesetu-ai"
        Write-Host "gcloud run deploy schemesetu-ai --image gcr.io/schemesetu-ai/schemesetu-ai --platform managed --region us-central1"
    }
    "3" {
        Write-Host ""
        Write-Host "📤 Deploying to Firebase (hosting + functions)..." -ForegroundColor Yellow
        firebase deploy
    }
    default {
        Write-Host "Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed instructions, see: FIREBASE_DEPLOYMENT.md" -ForegroundColor Cyan
