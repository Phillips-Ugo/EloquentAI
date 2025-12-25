# 🎯 Correct Deployment Order

## The Right Way to Deploy

### Step 1: Deploy Backend FIRST ⚠️

**Why?** You need the backend URL before you can configure the frontend.

1. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Root Directory: `server`
   - Get your Railway URL (e.g., `eloquent-ai-backend.railway.app`)

2. **Note Your Backend URLs:**
   ```
   API URL: https://eloquent-ai-backend.railway.app
   WebSocket URL: wss://eloquent-ai-backend.railway.app/ws
   ```

### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **New Project** → Import GitHub repo
3. **Configure:**
   - Root Directory: `client`
   - Framework: Other

4. **Add Environment Variables (Use REAL URLs from Step 1):**
   ```
   REACT_APP_API_URL=https://eloquent-ai-backend.railway.app
   REACT_APP_WS_URL=wss://eloquent-ai-backend.railway.app/ws
   NODE_ENV=production
   ```
   ⚠️ **Replace with YOUR actual Railway URL!**

5. **Deploy!**

### Step 3: Update Backend CORS

1. **Go back to Railway**
2. **Add Environment Variable:**
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
   Replace with your actual Vercel URL

3. **Redeploy backend** (Railway auto-redeploys on env changes)

## ✅ Quick Checklist

- [ ] Backend deployed on Railway
- [ ] Backend URL obtained (e.g., `your-app.railway.app`)
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set with REAL backend URL
- [ ] Backend CORS updated with frontend URL
- [ ] Test: Frontend can call backend API
- [ ] Test: WebSocket connects (if using real-time features)

## 🔄 If You Already Deployed Frontend

If you already deployed frontend with placeholder values:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   - `REACT_APP_API_URL` → Your Railway backend URL
   - `REACT_APP_WS_URL` → Your Railway WebSocket URL (wss://)
3. Redeploy (or wait for auto-redeploy)

## 📝 Example Real Values

After deploying backend to Railway, you might have:

```
REACT_APP_API_URL=https://eloquent-ai-production.up.railway.app
REACT_APP_WS_URL=wss://eloquent-ai-production.up.railway.app/ws
NODE_ENV=production
```

After deploying frontend to Vercel, you might have:

```
ALLOWED_ORIGINS=https://eloquent-ai.vercel.app
```

## 🚨 Common Mistakes

❌ **Wrong**: Deploy frontend first with placeholder URLs
✅ **Right**: Deploy backend first, get real URL, then deploy frontend

❌ **Wrong**: Using `http://` for production
✅ **Right**: Use `https://` for API and `wss://` for WebSocket

❌ **Wrong**: Forgetting to update CORS on backend
✅ **Right**: Add frontend URL to `ALLOWED_ORIGINS` on backend


