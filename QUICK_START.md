# Quick Start Guide - After Optimization

**Last Updated:** August 6, 2026  
**Status:** ✅ Mobile PTT optimized, Connection status working

---

## 🚀 Starting the System

### 1. Start Backend (Required)
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Wait for:** `Application startup complete.`

---

### 2. Start Frontend (For Laptop Mode)
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\frontend
npm run dev
```

**Open:** http://localhost:3000

---

### 3. Start Remote Controller (For Mobile)

**Option A: Local Network (same WiFi)**
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\remote-controller
npm run dev
```

**Mobile:** Open phone browser → `http://YOUR_LAPTOP_IP:5173/`

**Option B: Internet Access (via ngrok)**
```powershell
# Terminal 1: Start ngrok
ngrok http 8000

# Note the https:// URL (e.g., https://abc123.ngrok-free.app)

# Terminal 2: Update remote-controller/.env
VITE_BACKEND_WS_URL=wss://abc123.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://abc123.ngrok-free.app

# Terminal 3: Start remote
cd remote-controller
npm run dev
```

**Mobile:** Open phone browser → `http://localhost:5173/` or the Vite network URL

---

## 📱 Using Mobile Remote

### First Time Setup
1. Open phone browser
2. Navigate to remote controller URL
3. **Allow microphone access** when prompted
4. Wait for green "Connected" status

### How to Talk
1. **Hold** the big talk button
2. **Speak** your question
3. **Release** button immediately after speaking
4. Wait for avatar response (appears on laptop screen)

### What You'll See on Mobile
- Your spoken text (transcript)
- Avatar's text response
- Status: "Thinking..." while processing
- Persona selector at top
- Language selector at bottom

---

## 💻 Using Laptop Mode

### How to Talk (Keyboard)
1. Focus the browser window
2. **Hold "A" key** on keyboard
3. **Speak** your question
4. **Release "A"** after speaking
5. Avatar responds on screen

### How to Talk (Mouse)
1. **Click and hold** the green talk button
2. **Speak** your question
3. **Release** button
4. Avatar responds on screen

### What You'll See
- 3D avatar with facial animation
- Live captions below avatar
- Persona switcher (top-right)
- Language selector (bottom)
- **Connection badge** (bottom-right) when mobile is connected

---

## 🔗 Connection Status Badge (NEW)

### What It Shows
When mobile remote is connected, laptop shows:
```
┌─────────────────────────────┐
│ 🟢 Remote Connected         │
└─────────────────────────────┘
```

### When It Appears
- ✅ Mobile connects → Badge appears immediately
- ✅ Laptop opens while mobile connected → Badge shows on load
- ✅ Mobile disconnects → Badge disappears automatically
- ✅ Mobile reconnects → Badge reappears automatically

### What It Means
- **Badge visible:** Mobile remote is active and working
- **Badge hidden:** No mobile remote connected (laptop-only mode)

---

## 🎭 Switching Personas

### On Mobile
1. Tap persona chip at top (e.g., "Dr. Srujana")
2. Wait 1 second
3. New persona is active

### On Laptop
1. Click persona tile on right side
2. Wait 1 second
3. New persona is active

### Available Personas
- **Dr. A. Obulesu** (HOD) - Purple accent
- **Dr. Srujana** (Principal) - Blue accent
- **Dr. Padmaja** (Dean) - Green accent
- **Palla Rajeshwar Reddy** (Chairman) - Brown accent

**Note:** Switching persona clears conversation history

---

## 🌐 Language Selection

### Languages Available
- **Auto** - Detects language automatically
- **EN** - English
- **हि** - Hindi
- **తె** - Telugu

### How to Switch
**Mobile:** Tap language pill at bottom  
**Laptop:** Click language pill in controls

---

## ⚡ Performance Notes (After Optimization)

### Mobile Push-to-Talk
- **Faster response:** ~50-150ms improvement
- **Feels instant:** Button release → "Thinking..." appears immediately
- **Backend starts faster:** Audio processing happens in parallel

### Connection Reliability
- **Auto-reconnect:** If WiFi drops, reconnects within 2-8 seconds
- **Heartbeat:** Keeps connection alive every 15 seconds
- **Status updates:** Real-time badge updates without page refresh

---

## 🐛 Troubleshooting

### Mobile: "Mic unavailable"
**Cause:** Browser denied microphone access  
**Fix:** 
1. Check browser URL is HTTPS or localhost
2. Settings → Site permissions → Microphone → Allow
3. Refresh page

### Mobile: Talk button disabled
**Cause:** Not connected to backend  
**Fix:**
1. Check backend is running (`uvicorn` terminal)
2. Check `.env` file has correct ngrok URL
3. Check ngrok tunnel is active

### Laptop: Avatar doesn't respond
**Cause:** WebSocket not connected  
**Fix:**
1. F12 → Network → WS tab → Check for `/ws` connection
2. Check backend is running
3. Hard refresh: Ctrl+Shift+R

### Badge doesn't show on laptop
**Cause:** Mobile not connected or backend not relaying  
**Fix:**
1. Verify mobile shows "Connected" status
2. Check backend logs for "Remote connected" message
3. Refresh laptop browser

### Audio quality warnings in console
**Expected:** `[Audio] Quality below threshold` is informational  
**Action:** None required - backend handles this gracefully

---

## 📊 System Status Check

### Backend Health
```powershell
curl http://localhost:8000/health
```
**Expected:** `{"status":"ok",...}`

### Frontend Loaded
Open: http://localhost:3000  
**Expected:** Avatar visible, no console errors

### Remote Controller Loaded
Open mobile browser → remote URL  
**Expected:** "Connected" status, green dot

### WebSocket Connections
F12 → Network → WS tab  
**Expected:**
- Laptop: `/ws` connected
- Mobile: `/ws/remote` connected

---

## 🎯 Quick Test Sequence

1. **Start backend** → Wait for "startup complete"
2. **Open laptop browser** → See avatar
3. **Open mobile browser** → See "Connected"
4. **Check laptop** → See "Remote Connected" badge
5. **Mobile: Hold button** → Speak → Release
6. **Laptop avatar** → Should respond
7. **Success!** 🎉

---

## 📝 Tips & Best Practices

### For Best Audio Quality
- Speak clearly and at normal volume
- Hold button for at least 1 second
- Don't release button mid-word
- Use in quiet environment

### For Stable Connection
- Use WiFi (not cellular data for local mode)
- Keep phone browser in foreground
- Don't close/switch tabs during speech

### For Faster Responses
- Speak concisely (2-5 second utterances)
- Release button immediately after speaking
- Wait for full response before next question

---

## 🔧 Configuration Files

### Backend: `backend/.env`
```
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
ELEVENLABS_API_KEY=sk_...
```

### Frontend: `frontend/.env.local`
```
NEXT_PUBLIC_WS_URL=wss://YOUR_NGROK.ngrok-free.app/ws
NEXT_PUBLIC_API_URL=https://YOUR_NGROK.ngrok-free.app
```

### Remote: `remote-controller/.env`
```
VITE_BACKEND_WS_URL=wss://YOUR_NGROK.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://YOUR_NGROK.ngrok-free.app
```

---

## ✅ Everything Working?

**You should see:**
- ✅ Backend running on port 8000
- ✅ Frontend showing avatar at localhost:3000
- ✅ Mobile showing "Connected" status
- ✅ Laptop showing "Remote Connected" badge
- ✅ Mobile can talk to avatar (faster response!)
- ✅ Laptop can talk to avatar (keyboard "A")
- ✅ Avatar animates and speaks

**If not, see:** TEST_SCRIPT.md for detailed troubleshooting

---

**Need Help?** Check OPTIMIZATION_SUMMARY.md for technical details
