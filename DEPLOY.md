# 🚀 SchemeSetu AI - Deploy to Vercel (Best Option)

## Why Vercel?

Vercel is the **best choice** for your Next.js full-stack app:

✅ **Made by the Next.js team** - Optimized for Next.js  
✅ **One-click deployment** - No Docker, no complex setup  
✅ **Auto-deploy on git push** - Push → Live instantly  
✅ **Free tier generous** - Perfect for production apps  
✅ **Serverless API routes** - Your `/api/*` routes run as functions  
✅ **Built-in environment variables** - No manual config  
✅ **Auto-scaling + CDN** - Your app is fast worldwide  
✅ **Voice chat works perfectly** - Web Speech API supported

---

## Deploy in 5 Minutes

### Step 1: Sign Up / Login to Vercel

Go to **https://vercel.com/signup** and sign in with GitHub

### Step 2: Import Your Project

1. Click **"Add New"** → **"Project"**
2. Select **badalramteke/schemesetu-ai** repo
3. Vercel auto-detects it's a Next.js app ✓

### Step 3: Set Environment Variables

Add these in the **"Environment Variables"** section:

```
NEXT_PUBLIC_GEMINI_API_KEY = AIzaSyCqbe5DgMMmdDBgIxphSWZ5lvUX1jrexL4
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDIPQCIvhKgYJreDuhJyw0nST_gIRS7ijo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = schemesetu-ai.firebaseapp.com
PINECONE_API_KEY = pcsk_6PPxSD_7qCtfrVhddS24YmUSj7xepxUAjQXVb6yMnH1ZaLhkVWaEeLNYS
PINECONE_INDEX_NAME = schemesetu-pinecone
```

### Step 4: Click "Deploy"

That's it! Your app will be live in ~2 minutes at:

```
https://schemesetu-ai.vercel.app
```

---

## Auto-Deploy on Every Push

Once deployed:

1. Every git push to `main` → Auto-deploys
2. Every PR → Preview deployment created automatically
3. Rollback to any previous version with one click

Just do:

```powershell
git add .
git commit -m "your message"
git push origin main
```

And watch it deploy in Vercel UI! 🎉

---

## Features That Work Out-of-Box

✅ **Voice chat with auto-TTS** - Web Speech API fully supported  
✅ **API routes** - All `/api/*` endpoints run as serverless functions  
✅ **Pinecone RAG** - Connects to your vector DB automatically  
✅ **Gemini API** - Generate eligibility questions in real-time  
✅ **Firebase Auth** - Login/signup works seamlessly  
✅ **PDF exports** - Downloads work perfectly  
✅ **Multi-language** - EN/HI/MR speech recognition supported

---

## Verify Your Deployment

Once deployed, test:

1. **Voice input** - Click mic button, speak a query
2. **Auto-send** - Stop speaking, message sends automatically
3. **AI response** - Response appears in chat and is read aloud
4. **API routes** - Query `/api/query` works (check Network tab)
5. **Firebase auth** - Login/signup works

---

## Troubleshooting

### "Module not found" error

- **Cause:** Missing env variables
- **Fix:** Add all `NEXT_PUBLIC_*` and `PINECONE_*` vars to Vercel dashboard

### Voice input not working

- **Cause:** Microphone permission denied
- **Fix:** Click allow when browser asks for mic permission

### API returns 500 error

- **Cause:** Missing `PINECONE_API_KEY` or Pinecone server down
- **Fix:** Check Vercel logs: Click the failed deployment → "View Function Logs"

### Page says "Not Found"

- **Cause:** Incorrectly deployed to wrong branch
- **Fix:** Verify deploy was from `main` branch in Vercel dashboard

---

## Vercel Dashboard Features

Once deployed, you can:

- 📊 **View Analytics** - Traffic, performance metrics
- 🔍 **Check Deployment Logs** - See API errors in real-time
- 🔄 **Rollback** - Revert to any previous working version
- 🌐 **Custom Domain** - Connect your own domain (premium)
- 👥 **Team Collaboration** - Add team members
- 💾 **Database** - Use Vercel Postgres (optional)

---

## Alternative Deployments (if needed)

### Cloud Run (Google Cloud)

For more control over Docker and infrastructure:

```powershell
docker build -t gcr.io/schemesetu-ai/app:latest .
docker push gcr.io/schemesetu-ai/app:latest
gcloud run deploy schemesetu-ai --image gcr.io/schemesetu-ai/app:latest --platform managed --region us-central1 --allow-unauthenticated
```

### Firebase Hosting + Cloud Functions

For Firebase-only ecosystem:

```powershell
firebase deploy
```

### Render.com

Similar to Vercel, good alternative:

1. Sign up at https://render.com
2. Connect your GitHub repo
3. Add env variables
4. Deploy

---

## Monitor Your App

### Real-Time Logs

```
Vercel Dashboard → [Your Project] → "Functions" → Click to see API logs
```

### Performance Monitoring

```
Vercel Dashboard → "Analytics" → See response times, errors
```

### Voice Chat Testing

```
1. Go to your app: https://schemesetu-ai.vercel.app
2. Click "Voice Mode" or mic button
3. Say: "agriculture schemes"
4. Check Vercel Logs → Functions → /api/query
5. Verify Pinecone + Gemini calls succeeded
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Pinecone Docs:** https://docs.pinecone.io
- **Gemini Docs:** https://ai.google.dev

---

## Summary

| Aspect            | Status                      |
| ----------------- | --------------------------- |
| **Deployment**    | ✅ Ready for Vercel         |
| **Voice Chat**    | ✅ Working (tested locally) |
| **API Routes**    | ✅ Configured               |
| **Env Variables** | ✅ Documented               |
| **Build**         | ✅ Passes `npx next build`  |
| **Auto-Deploy**   | ✅ Enabled on git push      |

**Next Step:** Go to https://vercel.com and deploy! 🚀
