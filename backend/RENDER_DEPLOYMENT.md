# Deploying Backend to Render

## Prerequisites
- GitHub account with this repository
- Render account (free tier available at https://render.com)

## Deployment Steps

### 1. Create a Render Account
1. Go to https://render.com
2. Sign up with your GitHub account

### 2. Create a New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `tolesatesfaye327-boop/Gamtaa-Barattoota`
3. Select the repository from the list

### 3. Configure the Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `gbaabw-backend` (or your preferred name)
- **Region:** Oregon (US West) or closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/index.js`

**Instance Type:**
- Select **Free** (or paid plan if you prefer)

### 4. Add Environment Variables

Click "Advanced" and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://gbaabw_admin:gbaabwPass2026@cluster0.un0k81j.mongodb.net/gbaabw?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` (generate a strong secret) |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | `https://gamataa-barattoota-ada-aa-bargaa.vercel.app` |
| `PORT` | `10000` (Render uses this by default) |

**IMPORTANT:** Update the `JWT_SECRET` with a secure random string!

### 5. Deploy

1. Click "Create Web Service"
2. Wait for the deployment to complete (usually 2-5 minutes)
3. Render will provide you with a URL like: `https://gbaabw-backend.onrender.com`

### 6. Verify Deployment

Test your API endpoints:
- Health check: `https://your-app.onrender.com/api/health`
- Root: `https://your-app.onrender.com/`

### 7. Update Frontend

After deployment, update your Vercel environment variables:

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `VITE_API_URL` to: `https://your-app.onrender.com/api`
5. Redeploy your frontend

## Important Notes

### Free Tier Limitations
- Your service will spin down after 15 minutes of inactivity
- First request after inactivity takes ~30-60 seconds (cold start)
- 750 hours/month free (enough for one service running 24/7)

### Performance
- Free tier is suitable for testing and low-traffic applications
- Consider upgrading to paid tier for production use

### Auto-Deploy
Render automatically deploys when you push to the `main` branch

### Monitoring
- View logs in the Render dashboard
- Check deployment status and history
- Monitor resource usage

## Troubleshooting

### Build Fails
- Check that `package.json` has all required dependencies
- Verify TypeScript compiles locally with `npm run build`

### App Crashes
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### CORS Errors
- Verify frontend URL is in allowed origins
- Check that environment variables are set in Render

## Next Steps

After successful deployment:
1. ✅ Update Vercel environment variable with new Render URL
2. ✅ Test all API endpoints from your frontend
3. ✅ Update any documentation with new API URL
4. ✅ Consider setting up a custom domain (optional)

## Support

For Render-specific issues:
- Documentation: https://render.com/docs
- Community: https://community.render.com
