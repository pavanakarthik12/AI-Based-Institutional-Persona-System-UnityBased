# 🚀 Complete Setup Guide - AI Institutional Persona System

**Quick Start Guide to Get Everything Running**

---

## ⚠️ Prerequisites Check

### 1. Python Installation (Required for Backend)

**Check if Python is installed:**
```powershell
python --version
```

**If you see "Python was not found":**

**Option A: Install Python via Microsoft Store (Easiest)**
1. Open Microsoft Store
2. Search for "Python 3.13" or "Python 3.12"
3. Click "Get" or "Install"
4. Wait for installation
5. Restart PowerShell

**Option B: Download from python.org**
1. Go to: https://www.python.org/downloads/
2. Download "Python 3.13.x" or "Python 3.12.x"
3. Run installer
4. ⚠️ **IMPORTANT:** Check "Add Python to PATH"
5. Click "Install Now"
6. Restart PowerShell

**Verify installation:**
```powershell
python --version
# Should show: Python 3.13.x or 3.12.x
```

---

### 2. Node.js Installation (Required for Frontend & Remote)

**Check if Node.js is installed:**
```powershell
node --version
npm --version
```

**If not installed:**
1. Go to: https://nodejs.org/
2. Download "LTS" version (recommended)
3. Run installer
4. Accept all defaults
5. Restart PowerShell

**Verify installation:**
```powershell
node --version  # Should show: v20.x.x or v22.x.x
npm --version   # Should show: 10.x.x
```

---

## 📦 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\backend"
```

### 1.2 Create Virtual Environment
```powershell
python -m venv .venv
```

**Expected:** A `.venv` folder appears in the backend directory

### 1.3 Activate Virtual Environment
```powershell
.\.venv\Scripts\Activate.ps1
```

**Expected:** Your prompt now shows `(.venv)` at the beginning

**If you get "execution policy" error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try activate again
```

### 1.4 Install Python Dependencies
```powershell
pip install -r requirements.txt
```

**Expected:** Lots of packages install (takes 2-5 minutes)

### 1.5 Verify .env File Exists
```powershell
Test-Path .env
```

**Expected:** `True`

**If False:**
```powershell
# Copy the .env file that was already created
dir .env
```

### 1.6 Start Backend Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**✅ Backend is now running!** Leave this terminal open.

**Test it:**
Open browser → http://127.0.0.1:8000/health

**Should see:** `{"status":"ok",...}`

---

## 💻 Step 2: Frontend Setup (Laptop Mode)

### 2.1 Open NEW PowerShell Window
(Keep backend running in first window)

### 2.2 Navigate to Frontend Directory
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\frontend"
```

### 2.3 Install Dependencies (First Time Only)
```powershell
npm install
```

**Expected:** Packages install (takes 2-5 minutes first time)

### 2.4 Verify .env.local Exists
```powershell
Test-Path .env.local
```

**Expected:** `True` (file was already created)

### 2.5 Start Frontend Development Server
```powershell
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x
- Local:        http://localhost:3000
- Ready in Xs
```

**✅ Frontend is now running!** Leave this terminal open.

**Test it:**
Open browser → http://localhost:3000

**Should see:** 3D avatar loading on screen

---

## 📱 Step 3: Mobile Remote Controller Setup

### 3.1 Open THIRD PowerShell Window
(Keep backend and frontend running)

### 3.2 Navigate to Remote Controller Directory
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\remote-controller"
```

### 3.3 Install Dependencies (First Time Only)
```powershell
npm install
```

**Expected:** Packages install (takes 1-2 minutes first time)

### 3.4 Verify .env Exists
```powershell
Test-Path .env
```

**Expected:** `True` (file was already created with ngrok URL)

### 3.5 Start Remote Controller Server
```powershell
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in Xms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.X:5173/
```

**✅ Remote Controller is now running!** Leave this terminal open.

---

## 🌐 Step 4: Access on Mobile (Using ngrok)

### Current Setup
Your `.env` file already has:
```
VITE_BACKEND_WS_URL=wss://012a-103-105-178-99.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://012a-103-105-178-99.ngrok-free.app
```

### 4.1 Verify ngrok Tunnel is Active
The ngrok URL in your `.env` needs to be active. Check with:
```powershell
curl https://012a-103-105-178-99.ngrok-free.app/health
```

**If it fails:** The ngrok tunnel expired. You need to:

#### Option A: Use Local Network (Easier)
1. Find your laptop's IP address:
```powershell
ipconfig | Select-String -Pattern "IPv4"
# Look for something like 192.168.1.X
```

2. Update `remote-controller/.env`:
```
VITE_BACKEND_WS_URL=ws://YOUR_LAPTOP_IP:8000/ws/remote
VITE_BACKEND_API_URL=http://YOUR_LAPTOP_IP:8000
```

3. On mobile browser: `http://YOUR_LAPTOP_IP:5173/`

#### Option B: Start New ngrok Tunnel

**Install ngrok (if not installed):**
1. Go to: https://ngrok.com/
2. Sign up for free account
3. Download ngrok for Windows
4. Extract and add to PATH

**Start ngrok:**
```powershell
ngrok http 8000
```

**Copy the https:// URL**, then update `remote-controller/.env`:
```
VITE_BACKEND_WS_URL=wss://YOUR_NEW_NGROK_URL.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://YOUR_NEW_NGROK_URL.ngrok-free.app
```

**Restart remote controller** (CTRL+C, then `npm run dev`)

---

## ✅ Final Verification

### All Three Terminals Should Show:

**Terminal 1 (Backend):**
```
INFO:     Application startup complete.
```

**Terminal 2 (Frontend):**
```
✓ Ready in Xs
- Local:        http://localhost:3000
```

**Terminal 3 (Remote Controller):**
```
➜  Local:   http://localhost:5173/
```

### Test Everything:

**1. Backend Health:**
```powershell
curl http://localhost:8000/health
```
✅ Should return JSON with `"status":"ok"`

**2. Frontend:**
- Open: http://localhost:3000
- ✅ Should see 3D avatar
- ✅ Hold "A" key to test microphone

**3. Mobile Remote:**
- On phone browser: Open the remote URL
- ✅ Should show "Connected" (green)
- ✅ Should show persona selector
- ✅ Hold talk button to test

**4. Connection Badge:**
- On laptop: http://localhost:3000
- When mobile connects, bottom-right should show:
- ✅ "🟢 Remote Connected" badge

---

## 🎯 Quick Commands Summary

### Start Everything (Three Terminals):

**Terminal 1: Backend**
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2: Frontend**
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\frontend"
npm run dev
```

**Terminal 3: Remote Controller**
```powershell
cd "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\remote-controller"
npm run dev
```

### Stop Everything:
Press `CTRL+C` in each terminal

---

## 🐛 Common Issues

### Issue: "Python was not found"
**Fix:** Install Python (see Prerequisites)

### Issue: "npm: command not found"
**Fix:** Install Node.js (see Prerequisites)

### Issue: ".venv\Scripts\Activate.ps1 cannot be loaded"
**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Port 8000 already in use"
**Fix:** Kill existing process:
```powershell
Get-Process -Name "python" | Stop-Process -Force
```

### Issue: "Port 3000 already in use"
**Fix:** Kill existing process:
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

### Issue: Mobile shows "Disconnected"
**Fix:**
1. Check backend is running (Terminal 1)
2. Check ngrok tunnel or use local IP
3. Update `.env` files with correct URLs
4. Restart remote controller

### Issue: Microphone not working
**Fix:**
1. Browser needs HTTPS or localhost
2. Grant microphone permissions in browser
3. Check: Settings → Site Permissions → Microphone

---

## 📞 Need Help?

1. Check terminal outputs for error messages
2. Verify all three terminals are running
3. Test each URL individually
4. Check browser console (F12) for errors
5. Review QUICK_START.md for usage instructions

---

**Ready to go? Follow the steps above in order!** 🚀
