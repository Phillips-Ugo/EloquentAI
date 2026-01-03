# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide provides step-by-step instructions for deploying your Eloquent AI application.

## Overview

- **Frontend (React)**: Deploy to Vercel
- **Backend (Node.js)**: Deploy to Render

---

## Part 1: Deploy Frontend to Vercel

### Prerequisites
- GitHub account with your repository
- Vercel account (free tier available)

### Step 1: Fix Dependencies
✅ **Already completed**: `@mediapipe/tasks-vision` has been added to `client/package.json`

### Step 2: Configure Vercel Project

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Sign in or create an account
   - Click "Add New Project"

2. **Import Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: `client` (IMPORTANT!)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
   - **Install Command**: `npm install` (default)

   OR use the `vercel.json` file (already configured):
   - The root `vercel.json` is configured to build from the client directory
   - Vercel should auto-detect this configuration

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=https://your-render-backend-url.onrender.com
   ```
   Replace `your-render-backend-url` with your actual Render backend URL (you'll get this after deploying to Render).

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your frontend will be live at `https://your-project.vercel.app`

### Step 3: Verify Deployment
- Check the build logs for any errors
- Visit your Vercel URL to confirm the app loads
- Check browser console for any API connection errors

---

## Part 2: Deploy Backend to Render

### Prerequisites
- GitHub account with your repository
- Render account (free tier available)

### Step 1: Prepare Backend for Deployment

1. **Verify Server Entry Point**
   - Your server entry point is: `server/index.js`
   - Port configuration: Uses `process.env.PORT` (Render sets this automatically)

2. **Check Dependencies**
   - All dependencies are in `server/package.json`
   - No additional setup needed

### Step 2: Create Render Web Service

1. **Go to [Render Dashboard](https://dashboard.render.com)**
   - Sign in or create an account
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Connect"

3. **Configure Service Settings**

   **Basic Settings:**
   - **Name**: `eloquent-ai-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server` (IMPORTANT!)

   **Build & Deploy:**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

   **OR use the `render.yaml` file:**
   - If you prefer, you can use the `render.yaml` file provided
   - Go to "Infrastructure as Code" → "New Blueprint"
   - Connect your repo and select `render.yaml`
   - Render will create the service automatically

4. **Set Environment Variables**
   Click "Environment" tab and add:

   **Required:**
   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   ```

   **API Keys (if needed):**
   ```
   OPENAI_API_KEY=your-openai-key
   GOOGLE_API_KEY=your-google-key
   JWT_SECRET=your-jwt-secret
   ```

   **Other variables:**
   - Add any other environment variables your backend needs
   - Check `env.example` for reference

5. **Advanced Settings (Optional)**
   - **Auto-Deploy**: Enable to auto-deploy on git push
   - **Health Check Path**: `/api/health` (if you have a health endpoint)
   - **Plan**: Free tier is fine for testing (has limitations)

6. **Create Service**
   - Click "Create Web Service"
   - Render will start building and deploying
   - Wait for deployment to complete (usually 2-5 minutes)

### Step 3: Get Backend URL

1. **Copy Your Backend URL**
   - After deployment, Render provides a URL like: `https://eloquent-ai-backend.onrender.com`
   - Copy this URL

2. **Update Frontend Environment Variable**
   - Go back to Vercel dashboard
   - Navigate to your project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` to your Render backend URL
   - Redeploy the frontend (or wait for auto-deploy)

### Step 4: Configure CORS

1. **Update Backend CORS Settings**
   - In Render dashboard, go to your backend service
   - Environment Variables
   - Set `CORS_ORIGIN` to your Vercel frontend URL:
     ```
     CORS_ORIGIN=https://your-project.vercel.app
     ```
   - Save and redeploy

2. **Verify CORS in Code**
   - Check `server/index.js` - CORS should allow your frontend origin
   - The code should use `process.env.CORS_ORIGIN` or allow all origins in production

### Step 5: Test the Deployment

1. **Test Backend**
   - Visit: `https://your-backend.onrender.com/api/health` (if health endpoint exists)
   - Should return a success response

2. **Test Frontend**
   - Visit your Vercel URL
   - Try making API calls from the frontend
   - Check browser console and network tab for errors

---

## Troubleshooting

### Vercel Build Fails

**Issue**: Module not found errors
- **Solution**: Ensure all dependencies are in `client/package.json`
- ✅ `@mediapipe/tasks-vision` has been added

**Issue**: Build command fails
- **Solution**: Check that `vercel.json` points to the correct directory
- Verify `rootDirectory` is set to `client`

**Issue**: Environment variables not working
- **Solution**: Ensure variables start with `REACT_APP_` prefix
- Redeploy after adding new variables

### Render Deployment Fails

**Issue**: Build fails
- **Solution**: Check build logs in Render dashboard
- Ensure `Root Directory` is set to `server`
- Verify `package.json` exists in server directory

**Issue**: Service crashes on start
- **Solution**: Check logs in Render dashboard
- Verify `PORT` environment variable is set (Render sets this automatically)
- Check that all required environment variables are set

**Issue**: CORS errors
- **Solution**: Update `CORS_ORIGIN` in Render environment variables
- Ensure frontend URL is correctly set
- Check backend CORS configuration in `server/index.js`

**Issue**: API calls fail
- **Solution**: Verify `REACT_APP_API_URL` in Vercel matches Render backend URL
- Check network tab in browser for actual request URLs
- Ensure backend is running (check Render dashboard)

### Common Issues

**Cold Starts (Render Free Tier)**
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service

**WebSocket Connections**
- If using WebSockets, ensure Render plan supports persistent connections
- Free tier may have limitations

**File Uploads**
- Check file size limits
- Ensure proper error handling for large files
- Consider using cloud storage (S3, Cloudinary) for production

---

## Next Steps

1. **Set up Custom Domains** (Optional)
   - Vercel: Add custom domain in project settings
   - Render: Add custom domain in service settings

2. **Set up Monitoring**
   - Vercel: Built-in analytics available
   - Render: Check logs and metrics in dashboard

3. **Set up CI/CD**
   - Both platforms auto-deploy on git push
   - Configure branch protection in GitHub

4. **Database Setup** (If needed)
   - Render offers PostgreSQL databases
   - Create a new PostgreSQL database in Render
   - Update backend environment variables with database URL

5. **Environment-Specific Configs**
   - Use different environment variables for staging/production
   - Set up separate Render services for staging

---

## Quick Reference

### Vercel URLs
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

### Render URLs
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs

### Environment Variables Checklist

**Vercel (Frontend):**
- [ ] `REACT_APP_API_URL` - Your Render backend URL

**Render (Backend):**
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (or let Render set it)
- [ ] `CORS_ORIGIN` - Your Vercel frontend URL
- [ ] `OPENAI_API_KEY` (if using OpenAI)
- [ ] `GOOGLE_API_KEY` (if using Google APIs)
- [ ] `JWT_SECRET` (if using JWT)
- [ ] Any other API keys or secrets

---

## Support

If you encounter issues:
1. Check build/deployment logs in respective dashboards
2. Verify all environment variables are set correctly
3. Test locally first to ensure code works
4. Check documentation for both platforms

Good luck with your deployment! 🚀
