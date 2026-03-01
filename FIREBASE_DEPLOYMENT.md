# SchemeSetu AI - Firebase Deployment Guide

## ⚠️ Important: Full-Stack Apps Need Special Handling

This is a **full-stack Next.js app** with API routes, not a static site. Firebase Hosting alone cannot serve it.

**If you see "Page Not Found":** You deployed to Firebase Hosting, which only serves static files. Use **Cloud Run** instead (recommended).

## Prerequisites

- Google Cloud Project with billing enabled
- Firebase project: `schemesetu-ai`
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI: `gcloud` (for Cloud Run)
- Node.js 20+ and Docker

## Quick Deploy to Cloud Run (Recommended) ✅

Cloud Run is the best option for Next.js full-stack apps:

### 1. Authenticate with Google Cloud
```powershell
gcloud auth login
gcloud config set project schemesetu-ai
```

### 2. Build & Push Docker Image
```powershell
docker build -t gcr.io/schemesetu-ai/schemesetu-ai:latest .
docker push gcr.io/schemesetu-ai/schemesetu-ai:latest
```

### 3. Deploy to Cloud Run
```powershell
gcloud run deploy schemesetu-ai `
  --image gcr.io/schemesetu-ai/schemesetu-ai:latest `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars NEXT_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY,PINECONE_API_KEY=YOUR_API_KEY
```

✅ **Your app will be live at:** `https://schemesetu-ai-xxxxx.run.app`

---

## Alternative: Firebase Hosting Only (Static Export)

If you want to use only Firebase Hosting, you would need to:
1. Remove all API routes
2. Export the app as static HTML
3. This won't work for your app (has backend API routes)

---

## Environment Variables for Cloud Run

Set these in the gcloud command or update them in Cloud Run Console:

```powershell
--set-env-vars `
  NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCq..., `
  NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDI..., `
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=schemesetu-ai.firebaseapp.com, `
  PINECONE_API_KEY=pcsk_6PPxSD..., `
  PINECONE_INDEX_NAME=schemesetu-pinecone, `
  NODE_ENV=production
```

---

## Troubleshooting

### Error: "Page Not Found" on Firebase Hosting
- You deployed to Firebase Hosting which only serves static files
- Solution: Use Cloud Run instead (follow Quick Deploy steps above)

### Error: Image not found in Container Registry
- Docker image wasn't pushed to Google Container Registry
- Run: `docker push gcr.io/schemesetu-ai/schemesetu-ai:latest`

### Error: Permission denied during deploy
- You need billing enabled in Google Cloud
- Check: https://console.cloud.google.com/billing

### Error: Port already in use
- Cloud Run automatically uses port 8080
- The Dockerfile and server.js already use PORT env variable

---

## Stop & Delete Deployment

```powershell
# Delete Cloud Run service
gcloud run services delete schemesetu-ai --region us-central1

# Delete Docker image
gcloud container images delete gcr.io/schemesetu-ai/schemesetu-ai:latest
```

---

## Project Structure

```
├── .next/              # Built Next.js app
├── public/             # Static assets
├── server.js           # Node.js server
├── Dockerfile          # Container image
├── firebase.json       # Firebase config
├── .firebaserc         # Project reference
└── package.json        # Dependencies
```

---

## Comparison: Cloud Run vs Firebase Hosting

| Feature | Cloud Run | Firebase Hosting |
|---------|-----------|------------------|
| Full-stack apps | ✅ | ❌ |
| API routes | ✅ | ❌ |
| Server-side rendering | ✅ | ❌ |
| Static sites | ✅ | ✅ |
| Setup time | 5 min | 2 min |
| Cold starts | ~2-5s | <1s |
| Cost | Pay per request | Pay per file |
| **Recommended for this project** | ✅✅✅ | ❌ |

---

## Resources

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Docker for Next.js](https://nextjs.org/docs/deployment/docker)

