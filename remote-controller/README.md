# Remote Controller

Lightweight mobile remote controller for the AI Institutional Persona System.

## What This Is

A standalone web application that provides **only** the push-to-talk interface for mobile devices. The main kiosk avatar application remains separate and local to the laptop.

## Architecture

```
Phone → Remote Controller (port 3001) → FastAPI Backend → Laptop Kiosk (port 3000)
```

- **Remote Controller** (this app): Mobile-optimized push-to-talk interface
- **FastAPI Backend**: Existing AI pipeline (STT, LLM, TTS, visemes)
- **Laptop Kiosk**: Main avatar application with 3D rendering

## Features

✅ Push-to-talk microphone button  
✅ Connection status indicator  
✅ Persona selector  
✅ Live conversation transcript  
✅ Language selection (Auto/EN/HI/TE)  
✅ Automatic WebSocket reconnection  
✅ Secure context detection  

---

## 🚀 Quick Start Guide

### Prerequisites

1. **Backend must be running** on port 8000
2. **ngrok must be installed** and authenticated
3. **Phone and laptop on same WiFi** (for local testing) OR **ngrok for remote access**

---

## 📋 Complete Setup (Step by Step)

### Step 1: Start the Backend

```powershell
# Terminal 1
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for:** `Application startup complete.`

---

### Step 2: Tunnel the Backend with ngrok

```powershell
# Terminal 2 (new terminal)
ngrok http 8000
```

**Look for this line:**
```
Forwarding   https://abc123-xyz.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (e.g., `https://abc123-xyz.ngrok-free.app`)

---

### Step 3: Configure the Remote Controller

```powershell
# In the remote-controller directory
cd remote-controller
```

**Edit `.env` file** with your backend ngrok URL:

```env
VITE_BACKEND_WS_URL=wss://abc123-xyz.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://abc123-xyz.ngrok-free.app
```

Replace `abc123-xyz.ngrok-free.app` with your actual ngrok URL from Step 2.

---

### Step 4: Start the Remote Controller

```powershell
# Terminal 3 (in remote-controller directory)
npm run dev
```

**Wait for:**
```
VITE ready in XXXms
Local:   http://localhost:3001/
Network: http://192.168.0.9:3001/
```

---

### Step 5: Tunnel the Remote Controller with ngrok

```powershell
# Terminal 4 (new terminal)
ngrok http 3001
```

**Look for this line:**
```
Forwarding   https://def456-xyz.ngrok-free.app -> http://localhost:3001
```

**Copy the HTTPS URL** (e.g., `https://def456-xyz.ngrok-free.app`)

---

### Step 6: Start the Main Kiosk (Laptop)

```powershell
# Terminal 5 (new terminal)
cd frontend
npm run dev
```

**Wait for:**
```
Local:   http://localhost:3000
```

---

### Step 7: Access the Applications

#### 📱 On Your Phone

Open your browser and go to:
```
https://def456-xyz.ngrok-free.app
```

Replace `def456-xyz.ngrok-free.app` with YOUR ngrok URL from Step 5.

**Important:**
- ✅ Use `https://` (with the 's')
- ✅ Click "Visit Site" if you see an ngrok warning page
- ✅ Hold the green button to talk, release to send

#### 💻 On Your Laptop

Open your browser and go to:
```
http://localhost:3000
```

This shows the full kiosk with the 3D avatar.

---

## 🎯 What You Should See

### On Phone (Remote Controller)
```
┌─────────────────────────────────┐
│ Remote Controller    Connected  │
├─────────────────────────────────┤
│ [Dr. Obulesu] [Principal] ...   │ ← Personas
├─────────────────────────────────┤
│                                  │
│  Transcript appears here...      │ ← Conversation
│                                  │
├─────────────────────────────────┤
│ [Auto] [EN] [हि] [తె]           │ ← Language
│                                  │
│    ┌───────────────────┐        │
│    │                   │        │
│    │    [  MIC  ]      │        │ ← Hold to talk
│    │   Hold to talk    │        │
│    │                   │        │
│    └───────────────────┘        │
└─────────────────────────────────┘
```

### On Laptop (Kiosk)
```
┌─────────────────────────────────────────┐
│                                         │
│           [3D Avatar Here]              │ ← Animated avatar
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  User: Hello                            │
│  Assistant: Welcome! How can I help?   │ ← Live captions
└─────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### ❌ Remote shows "Connect to start" forever

**Problem:** Backend is not reachable

**Solution:**
1. Check backend is running: `http://localhost:8000/health`
2. Check ngrok tunnel is active in Terminal 2
3. Verify `.env` has correct backend URL
4. Restart remote: `npm run dev`

---

### ❌ "Microphone requires HTTPS" error

**Problem:** Not using HTTPS

**Solution:**
- Use the **ngrok HTTPS URL** (not the http:// or localhost)
- Make sure URL starts with `https://`
- Click through ngrok warning page if shown

---

### ❌ "Blocked" or Vite error on phone

**Problem:** Vite not allowing ngrok host

**Solution:**
1. Add your ngrok URL to `vite.config.js`:
   ```js
   allowedHosts: [
     'your-actual-url.ngrok-free.app',
     '.ngrok-free.app',
   ],
   ```
2. Restart remote: `npm run dev`

---

### ❌ Avatar not responding

**Problem:** Kiosk not open or not connected

**Solution:**
1. Open `http://localhost:3000` on laptop
2. Check connection status shows "Connected"
3. Both remote AND kiosk must be open simultaneously

---

### ❌ ngrok URLs keep changing

**Problem:** Free tier generates new URLs each restart

**Solution:**
Every time you restart ngrok:
1. Get new backend URL from Terminal 2
2. Update `remote-controller/.env`
3. Restart remote: `npm run dev`
4. Get new remote URL from Terminal 4
5. Use new remote URL on phone

---

## 📝 Summary of Running Services

| Service | Terminal | Port | Access |
|---------|----------|------|--------|
| Backend | 1 | 8000 | Local only |
| Backend ngrok | 2 | 8000 | `https://abc123.ngrok-free.app` |
| Remote | 3 | 3001 | Local only |
| Remote ngrok | 4 | 3001 | `https://def456.ngrok-free.app` |
| Kiosk | 5 | 3000 | `http://localhost:3000` |

**Total: 5 terminals running**

---

## 🎬 Usage Flow

1. **On phone:** Hold green button
2. **Speak** into the microphone
3. **Release** button when done
4. **Backend** processes: STT → LLM → TTS
5. **Laptop avatar** speaks and animates
6. **Phone** shows conversation text

---

## 🔄 Stopping Everything

Press `Ctrl+C` in each terminal (1-5) to stop all services.

---

## 📱 Alternative: Local Network Only (No ngrok)

If your phone and laptop are on the same WiFi:

### Step 1: Start Backend
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Configure Remote for Local Network

Edit `remote-controller/.env`:
```env
VITE_BACKEND_WS_URL=ws://192.168.0.9:8000/ws/remote
VITE_BACKEND_API_URL=http://192.168.0.9:8000
```

Replace `192.168.0.9` with your laptop's actual IP (from `ipconfig`).

### Step 3: Start Remote
```powershell
cd remote-controller
npm run dev
```

### Step 4: Start Kiosk
```powershell
cd frontend
npm run dev
```

### Step 5: Access

- **Phone:** `http://192.168.0.9:3001`
- **Laptop:** `http://localhost:3000`

**⚠️ Limitation:** Microphone won't work over `http://` unless it's localhost. You'll need ngrok or proper HTTPS certificate for mic access.

---

## Installation

If starting fresh:

```bash
cd remote-controller
npm install
```

## Configuration

The remote auto-detects the backend URL based on the page's hostname. For custom configuration:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your backend URLs:
   ```env
   VITE_BACKEND_WS_URL=wss://your-backend.ngrok-free.app/ws/remote
   VITE_BACKEND_API_URL=https://your-backend.ngrok-free.app
   ```

3. Restart the dev server

## Production Build

```bash
npm run build
npm run preview
```

## File Structure

```
remote-controller/
├── index.html         # Main HTML page
├── styles.css         # All styles (no framework needed)
├── main.js            # WebSocket, mic, and UI logic
├── vite.config.js     # Vite configuration (ngrok support)
├── package.json       # Vite dev server only
├── .env               # Environment variables (your ngrok URLs)
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Browser Requirements

- Modern browser with WebSocket support
- Microphone access (requires HTTPS or localhost)
- ES6+ JavaScript support

## Differences from Main Kiosk

| Feature | Remote | Kiosk |
|---------|--------|-------|
| 3D Avatar | ❌ No | ✅ Yes |
| Push-to-talk | ✅ Yes | ✅ Yes |
| Transcript | ✅ Yes | ✅ Yes |
| Audio playback | ❌ No | ✅ Yes |
| Viseme rendering | ❌ No | ✅ Yes |
| Debug panel | ❌ No | ✅ Yes |
| WebSocket endpoint | `/ws/remote` | `/ws` |

The remote is intentionally minimal — it only captures audio and displays text.
