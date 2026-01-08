# 🚀 ACE Platform - Deployment Guide

Complete guide for deploying your ACE Learning Platform to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Backend Setup

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create `.env` file from `.env.example`
- [ ] Set `ACE_SECRET` to a random secure key
- [ ] Test locally: `python backend/app.py`
- [ ] Backend runs on `http://localhost:5000`

### ✅ Frontend Setup

- [ ] Test all games work
- [ ] Test login/registration
- [ ] Test progress saving
- [ ] Check responsive design on mobile
- [ ] Verify all animations work

---

## 🌐 Backend Deployment

### Option 1: Deploy to Render (Recommended - Free Tier)

1. **Create Account:**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory

3. **Configure Service:**
   ```
   Name: ace-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   ```

4. **Add Environment Variables:**
   ```
   ACE_SECRET=<generate-random-32-char-string>
   ACE_DB_URI=sqlite:///ace.db
   FLASK_ENV=production
   PORT=5000
   CORS_ORIGINS=https://your-frontend-url.netlify.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 min)
   - Copy your backend URL: `https://ace-backend-xyz.onrender.com`

---

### Option 2: Deploy to Railway

1. **Create Account:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Python

3. **Add Environment Variables:**
   ```
   ACE_SECRET=<random-string>
   FLASK_ENV=production
   CORS_ORIGINS=https://your-frontend.com
   ```

4. **Get URL:**
   - Click "Generate Domain"
   - Copy: `https://ace-backend.up.railway.app`

---

### Option 3: Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login & Create App:**
   ```bash
   heroku login
   heroku create ace-backend
   ```

3. **Add Python Buildpack:**
   ```bash
   heroku buildpacks:set heroku/python
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set ACE_SECRET=your_secret_key
   heroku config:set FLASK_ENV=production
   heroku config:set CORS_ORIGINS=https://your-frontend.com
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Get URL:** `https://ace-backend.herokuapp.com`

---

## 🎨 Frontend Deployment

### Option 1: Deploy to Netlify (Recommended - Free)

1. **Create Account:**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Deploy:**
   - Drag and drop your project folder OR
   - Connect GitHub repository
   - Build settings: None needed (static HTML)
   - Publish directory: `/` (root)

3. **Update API URL:**
   - Open `scripts/main.js`
   - Line 29: Replace `your-production-api.com` with your backend URL
   - Example:
     ```javascript
     const API_BASE_URL = isLocal
         ? 'http://localhost:5000/api'
         : 'https://ace-backend-xyz.onrender.com/api';
     ```

4. **Commit & Push:**
   ```bash
   git add scripts/main.js
   git commit -m "Update production API URL"
   git push
   ```

5. **Netlify auto-deploys!**

6. **Get URL:** `https://ace-learning-abc123.netlify.app`

---

### Option 2: Deploy to Vercel

1. **Create Account:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy:**
   - Click "New Project"
   - Import your repository
   - Framework: Other
   - Root Directory: `/`
   - No build command needed

3. **Update API URL** (same as Netlify)

4. **Deploy:** Automatic!

5. **Get URL:** `https://ace-learning.vercel.app`

---

### Option 3: Deploy to GitHub Pages

1. **Update API URL** in `scripts/main.js`

2. **Create `gh-pages` branch:**
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings
   - Pages → Source: `gh-pages` branch
   - Save

4. **Get URL:** `https://yourusername.github.io/ACE`

---

## 🔒 Security Configuration

### Backend Security

1. **Generate Strong Secret Key:**
   ```python
   import secrets
   print(secrets.token_hex(32))
   # Use this for ACE_SECRET
   ```

2. **Update CORS:**
   ```python
   # In .env file
   CORS_ORIGINS=https://your-actual-frontend.com
   ```

3. **Use PostgreSQL for Production:**
   ```
   # Instead of SQLite
   ACE_DB_URI=postgresql://user:pass@host:5432/dbname
   ```

---

## 📊 Post-Deployment Testing

### Test Checklist:

1. **Backend Health:**
   - Visit: `https://your-backend.com/api/health`
   - Should return: `{"status": "healthy"}`

2. **Frontend:**
   - Open: `https://your-frontend.com`
   - Check console for API connection
   - Should see: "✅ Backend connected successfully"

3. **User Registration:**
   - Click "Login"
   - Register new account
   - Should succeed

4. **User Login:**
   - Login with registered account
   - Username should appear in nav

5. **Games:**
   - Open each game module
   - Play a few questions
   - Check if working

6. **Progress Saving:**
   - Play a game
   - Check browser console
   - Should see: "✅ Progress saved successfully"

7. **Leaderboard:**
   - Visit progress dashboard
   - Should load data

---

## 🐛 Troubleshooting

### Issue: "Backend connection failed"

**Solution:**
```javascript
// Check API_BASE_URL in scripts/main.js
// Make sure it matches your deployed backend URL
console.log(API_BASE_URL);
```

### Issue: "CORS error"

**Solution:**
```python
# Update backend .env file
CORS_ORIGINS=https://your-frontend-url.com

# Restart backend
```

### Issue: "Login not working"

**Solution:**
```
1. Check backend logs for errors
2. Verify ACE_SECRET is set
3. Test API endpoint directly:
   curl https://your-backend.com/api/health
```

### Issue: "Games not loading"

**Solution:**
```javascript
// Check browser console (F12)
// Look for JavaScript errors
// Verify all scripts loaded:
// - error-handler.js
// - theme-manager.js
// - main.js
```

---

## 📱 Custom Domain (Optional)

### For Frontend (Netlify):

1. Buy domain (e.g., GoDaddy, Namecheap)
2. In Netlify:
   - Site settings → Domain management
   - Add custom domain
3. Update DNS records as instructed
4. Wait 24-48 hours for propagation

### For Backend (Render):

1. In Render dashboard:
   - Service → Settings → Custom Domain
   - Add domain: api.yourdomain.com
2. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.onrender.com
   ```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push:

**Netlify & Vercel:**
- Automatically deploy on every push to `main` branch
- No configuration needed!

**Render:**
- Auto-deploys on push to `main`
- Can configure in service settings

**Railway:**
- Auto-deploys on every commit
- Configurable in project settings

---

## 📊 Monitoring

### Backend Monitoring:

1. **Render:**
   - Dashboard shows logs, metrics
   - CPU, memory usage visible

2. **Add Logging:**
   ```python
   # In backend/app.py
   import logging
   logging.basicConfig(level=logging.INFO)
   ```

### Frontend Monitoring:

1. **Google Analytics:**
   - Add to `index.html` `<head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_ID');
   </script>
   ```

---

## 💰 Cost Estimates

### Free Tier (Recommended for Start):

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Render** | ✅ Free | 750 hrs/month, sleeps after 15 min inactive |
| **Railway** | ✅ $5 credit/month | Enough for small apps |
| **Netlify** | ✅ Free | 100 GB bandwidth, unlimited sites |
| **Vercel** | ✅ Free | Unlimited sites, 100 GB bandwidth |

**Total Monthly Cost: $0** (Free tier is sufficient!)

### Paid Tiers (When You Scale):

- **Render:** $7/month (always-on)
- **Railway:** $5/month (500 hrs)
- **Netlify Pro:** $19/month
- **Custom Domain:** $10-15/year

---

## 🎯 Quick Deploy Commands

### Deploy Everything (Step-by-step):

```bash
# 1. Update production URL
# Edit scripts/main.js line 29

# 2. Commit changes
git add .
git commit -m "Ready for production"
git push

# 3. Deploy backend to Render
# (Use Render dashboard - connect GitHub)

# 4. Deploy frontend to Netlify
# (Drag and drop OR connect GitHub)

# 5. Test!
# Visit your frontend URL
```

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] `.env.example` created
- [ ] `.gitignore` updated
- [ ] Production API URL updated in frontend
- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] All environment variables documented

### Backend Deployment:
- [ ] Backend deployed (Render/Railway/Heroku)
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] Database configured
- [ ] CORS configured

### Frontend Deployment:
- [ ] API URL updated
- [ ] Frontend deployed (Netlify/Vercel)
- [ ] All pages loading
- [ ] Games functional
- [ ] Auth working

### Post-Deployment:
- [ ] Registration tested
- [ ] Login tested
- [ ] Progress saving tested
- [ ] All games tested
- [ ] Mobile responsive checked
- [ ] Performance acceptable
- [ ] No console errors

---

## 🎉 You're Live!

**Congratulations!** Your ACE Learning Platform is now live on the internet!

### Share Your Platform:

```
🎓 Check out ACE Learning Platform!
🔗 https://your-frontend-url.com

Features:
✨ Math Practice
✨ Language Skills
✨ Puzzle Solver
✨ Quiz Battle
✨ Programming Hub

Free to use! 🚀
```

---

## 📞 Need Help?

### Resources:

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Flask Deployment:** https://flask.palletsprojects.com/deployment/
- **Frontend Issues:** Check browser console (F12)
- **Backend Issues:** Check server logs

### Common Commands:

```bash
# View backend logs (Render)
# Check dashboard

# View frontend logs (Netlify)
# Check deploy logs in dashboard

# Test API locally
curl http://localhost:5000/api/health

# Test production API
curl https://your-backend.com/api/health
```

---

**Happy Deploying! 🚀**

Your ACE platform is now ready to help students around the world learn and grow!
