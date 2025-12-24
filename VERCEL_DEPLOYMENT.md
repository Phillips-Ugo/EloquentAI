# Vercel Deployment Guide for Eloquent AI

## 🚀 Quick Deploy to Vercel

### Option 1: Frontend Only (Recommended for Quick Start)

1. **Connect your GitHub repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

2. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   REACT_APP_WS_URL=wss://your-backend-url.com/ws
   NODE_ENV=production
   ```

4. **Deploy!**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

### Option 2: Full Stack (Frontend + API Routes)

**Note**: WebSocket support is limited on Vercel. For real-time features, deploy the server separately.

1. **Deploy Frontend to Vercel** (same as Option 1)

2. **Deploy Backend Separately** (Recommended platforms):
   - **Railway**: Best for Node.js with WebSocket support
   - **Render**: Good free tier, supports WebSocket
   - **Heroku**: Classic option, requires credit card
   - **DigitalOcean App Platform**: Good balance

3. **Update Environment Variables** in Vercel:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   REACT_APP_WS_URL=wss://your-backend.railway.app/ws
   ```

## 📋 Environment Variables Checklist

### Frontend (Vercel)
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_WS_URL` - WebSocket URL (if using real-time features)
- `NODE_ENV=production`

### Backend (Separate Deployment)
- `PORT` - Server port (usually auto-set by platform)
- `NODE_ENV=production`
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Secret for JWT tokens
- `DATABASE_URL` - Database connection string
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

## 🔧 Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure .gitignore includes:
node_modules/
.env
.env.local
build/
dist/
*.log
```

### Step 2: Deploy Frontend to Vercel

1. Install Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd client
vercel
```

Or use the Vercel dashboard for easier setup.

### Step 3: Deploy Backend (Railway Example)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `server`
5. Add environment variables
6. Deploy!

### Step 4: Update Frontend Environment Variables

In Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add `REACT_APP_API_URL` pointing to your backend
- Add `REACT_APP_WS_URL` for WebSocket (if needed)

## ⚠️ Important Notes

### WebSocket Limitations
Vercel doesn't support persistent WebSocket connections in serverless functions. For real-time features:

1. **Deploy server separately** (Railway, Render, etc.)
2. **Use polling** instead of WebSocket (less efficient)
3. **Use a WebSocket service** like Pusher or Ably

### File Upload Limitations
Large file uploads may hit Vercel's limits. Consider:
- Using direct upload to cloud storage (S3, Cloudinary)
- Deploying upload endpoint on a platform with better file handling

### Build Optimizations
The `vercel.json` is configured to:
- Build the React app in the `client` directory
- Serve static files efficiently
- Handle API routes (limited functionality)

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is deployed and accessible

### WebSocket Not Working
- Deploy backend separately (Vercel doesn't support WebSocket)
- Update `REACT_APP_WS_URL` to point to your backend
- Check WebSocket server is running

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

## 🎯 Recommended Architecture

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Railway       │
│   (Backend)     │
│   + WebSocket   │
└─────────────────┘
```

This setup gives you:
- ✅ Fast global CDN for frontend
- ✅ Full backend functionality
- ✅ WebSocket support
- ✅ Easy scaling
- ✅ Free tiers available

