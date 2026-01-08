# 🚀 ACE Platform - Quick Start Guide

## ⚠️ IMPORTANT: Start Backend First!

The login/registration system needs the backend to be running.

---

## 📋 Step-by-Step Instructions

### **Step 1: Install Dependencies**

```bash
# Navigate to your project
cd "C:\Users\Vinayak A D\OneDrive\Desktop\ACE\ACE (3)\ACE"

# Install Python dependencies
pip install -r requirements.txt
```

### **Step 2: Start Backend**

```bash
# Navigate to backend folder
cd backend

# Start the server
python app.py
```

**You should see:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://localhost:5000
```

**Keep this terminal window open!** ✅

---

### **Step 3: Open Frontend**

**Option A: Using Live Server (VS Code)**
1. Right-click on `index.html`
2. Select "Open with Live Server"
3. Browser opens automatically

**Option B: Direct Open**
1. Double-click `index.html`
2. Opens in your default browser

---

### **Step 4: Test Registration**

1. Click "Login" button in navigation
2. Click "Register here"
3. Fill in:
   - Name: Your name
   - Email: your@email.com
   - Password: (minimum 6 characters)
4. Click "Create Account"

**What should happen:**
- Loading spinner appears
- Alert: "✅ Account created! Please login."
- Switches to login form
- Email pre-filled

---

## 🐛 Troubleshooting

### Issue: "Nothing happens when clicking Create Account"

**Cause:** Backend is not running

**Solution:**
```bash
# Open a new terminal
cd backend
python app.py

# Keep it running!
```

---

### Issue: "Failed to fetch" or "Network error"

**Check:**
1. ✅ Backend is running on http://localhost:5000
2. ✅ No firewall blocking port 5000
3. ✅ Terminal shows "Running on..."

**Test backend directly:**
- Open browser
- Go to: http://localhost:5000/api/health
- Should see: `{"status": "healthy"}`

---

### Issue: "CORS error"

**Solution:** Backend should handle CORS automatically. If not:
1. Stop backend (Ctrl+C)
2. Check `backend/app.py` has CORS enabled
3. Restart: `python app.py`

---

### Issue: Password too short

**Error:** "Password must be at least 6 characters"

**Solution:** Use password with 6+ characters
- ❌ `12345` (5 chars)
- ✅ `123456` (6 chars)
- ✅ `mypass` (6 chars)

---

## 🧪 Quick Test Commands

### Test Backend Health:
```bash
# In browser or curl:
http://localhost:5000/api/health

# Should return:
{"status": "healthy", "timestamp": "...", "version": "1.0.0"}
```

### Test Registration API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Should return:
{"message": "Registered", "user_id": 1}
```

---

## 📊 System Requirements

### Backend:
- ✅ Python 3.8+
- ✅ Flask installed
- ✅ Port 5000 available

### Frontend:
- ✅ Modern browser (Chrome, Firefox, Edge)
- ✅ JavaScript enabled

---

## 🎯 Expected Workflow

```
1. Terminal 1: Backend Running ✅
   └─ python backend/app.py
   └─ Shows: "Running on http://localhost:5000"

2. Browser: Frontend Open ✅
   └─ index.html loaded
   └─ Can see homepage

3. Action: Click "Login" → "Register" ✅
   └─ Fill form
   └─ Click "Create Account"
   └─ See alert: "✅ Account created!"

4. Action: Login ✅
   └─ Enter email/password
   └─ Click "Login"
   └─ See username in nav bar!
```

---

## 💡 Pro Tips

### Keep Backend Running:
```bash
# Don't close this terminal!
# Backend must stay running while using the app
```

### Check Browser Console:
```
Press F12 → Console tab
Look for:
✅ "Backend connected successfully"
❌ "Backend connection failed"
```

### View Network Requests:
```
F12 → Network tab → Filter: XHR
See API calls to /api/auth/register
```

---

## 🔄 Restart Everything

If something breaks:

```bash
# 1. Stop backend (Ctrl+C in terminal)
# 2. Close browser tab
# 3. Restart backend:
cd backend
python app.py

# 4. Reload frontend:
Open index.html again
```

---

## ✅ Success Checklist

Before trying to register:

- [ ] Backend terminal shows "Running on http://localhost:5000"
- [ ] No errors in backend terminal
- [ ] Frontend loaded in browser
- [ ] Browser console (F12) shows no errors
- [ ] Clicked "Login" button - modal opens
- [ ] Clicked "Register here" - form shows
- [ ] Filled all fields (name, email, password 6+ chars)
- [ ] Now click "Create Account" ✅

---

## 📞 Still Not Working?

### Check Console Logs:

**Press F12 → Console**

You should see:
```
🌐 Environment detected: Local
📡 API Base URL: http://localhost:5000/api
🔄 Testing backend connection...
✅ Backend connected successfully
```

If you see errors:
```
❌ Backend connection failed
```

**Solution:** Start the backend!

---

## 🎉 When It Works

You'll see:
1. **Alert popup:** "✅ Account created! Please login."
2. **Toast notification:** Success message
3. **Form switches** to login
4. **Email pre-filled** in login form
5. **Console log:** "✅ Registration result: {user_id: 1}"

---

## 🚀 Next Steps After Registration

1. **Login** with your new account
2. **Username appears** in navigation bar
3. **Play games** - progress saves to your account
4. **Check progress** - goes to database
5. **Logout** - clears session

---

**Need More Help?**

Check the detailed logs:
- Backend terminal: See API requests
- Browser console (F12): See frontend logs
- Network tab (F12): See HTTP requests/responses

---

**Happy Learning!** 🎓✨
