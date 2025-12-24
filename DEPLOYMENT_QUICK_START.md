# 🚀 Quick Deployment Guide - Vercel

## Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your repository**
4. **Configure Project Settings:**
   - **Framework Preset**: Other
   - **Root Directory**: `client` (click "Edit" and set to `client`)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   REACT_APP_WS_URL=wss://your-backend-url.railway.app/ws
   NODE_ENV=production
   ```
   *(You'll update these after deploying the backend)*

6. **Click "Deploy"** 🎉

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
cd client
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? eloquent-ai (or your choice)
# - Directory? ./
# - Override settings? No
```

## Step 2: Deploy Backend to Railway (10 minutes)

**Why Railway?** It supports WebSocket and has a great free tier.

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your repository**
4. **Add Service** → **"Empty Service"**
5. **Configure:**
   - Click on the service → **Settings**
   - **Root Directory**: `server`
   - **Start Command**: `node index.js`
   - **Healthcheck Path**: `/api/health`

6. **Add Environment Variables:**
   Click "Variables" tab and add:
   ```
   PORT=5001
   NODE_ENV=production
   OPENAI_API_KEY=your-openai-key
   JWT_SECRET=your-secret-key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

7. **Deploy!** Railway will auto-deploy

8. **Get your URL:**
   - Click on your service → **Settings** → **Generate Domain**
   - Copy the URL (e.g., `your-app.railway.app`)

## Step 3: Connect Frontend to Backend

1. **Go back to Vercel Dashboard**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Update:**
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   REACT_APP_WS_URL=wss://your-app.railway.app/ws
   ```
4. **Redeploy** (Vercel will auto-redeploy on next push, or click "Redeploy")

## ✅ You're Done!

Your app should now be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (needs 18+)
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

### API Calls Fail
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is deployed and running

### WebSocket Not Working
- Verify `REACT_APP_WS_URL` uses `wss://` (secure WebSocket)
- Check Railway logs for WebSocket errors
- Ensure backend WebSocket server is running

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- ✅ `REACT_APP_API_URL` - Backend API URL
- ✅ `REACT_APP_WS_URL` - WebSocket URL (wss://)
- ✅ `NODE_ENV=production`

### Backend (Railway)
- ✅ `PORT` - Usually auto-set by Railway
- ✅ `NODE_ENV=production`
- ✅ `OPENAI_API_KEY` - Your OpenAI key
- ✅ `JWT_SECRET` - Random secret string
- ✅ `ALLOWED_ORIGINS` - Your Vercel frontend URL

## 🎯 Next Steps

1. **Custom Domain** (Optional)
   - Vercel: Settings → Domains
   - Railway: Settings → Generate Domain

2. **Monitor**
   - Vercel: Check deployment logs
   - Railway: Check service logs

3. **Scale**
   - Both platforms auto-scale
   - Railway: Upgrade plan for more resources

## 💡 Pro Tips

- Use Railway's **$5/month** plan for better performance
- Set up **automatic deployments** on git push
- Enable **Vercel Analytics** for performance monitoring
- Use **Railway's metrics** to monitor backend health

