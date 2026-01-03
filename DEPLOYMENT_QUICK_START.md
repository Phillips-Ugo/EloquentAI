# Quick Deployment Checklist

## ✅ Fixed Issues
- Added `@mediapipe/tasks-vision` to `client/package.json`
- Updated `vercel.json` to build from client directory
- Created `render.yaml` for backend deployment

## 🚀 Vercel Deployment (Frontend)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Import Repository** → Select your repo
3. **Configure:**
   - Root Directory: `client`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
   (Add this after you deploy backend to Render)
5. **Deploy!**

## 🖥️ Render Deployment (Backend)

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **New + → Web Service**
3. **Connect Repository**
4. **Configure:**
   - Name: `eloquent-ai-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node index.js`
5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
   (Add other API keys as needed)
6. **Deploy!**

## 📝 After Both Deployments

1. **Copy Render backend URL** (e.g., `https://eloquent-ai-backend.onrender.com`)
2. **Update Vercel environment variable:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` with your Render URL
   - Redeploy frontend
3. **Update Render CORS:**
   - Go to Render → Your Service → Environment
   - Update `CORS_ORIGIN` with your Vercel URL
   - Redeploy backend

## 📚 Full Guide
See `docs/DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
