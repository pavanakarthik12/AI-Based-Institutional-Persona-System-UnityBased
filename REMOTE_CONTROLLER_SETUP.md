# Remote Controller Setup Documentation

## Overview

This document explains the new architecture where the **mobile remote controller** is completely separate from the **main kiosk application**.

---

## Architecture

### Before (Old)
```
Next.js App (port 3000)
├── / (Avatar + Everything)
├── /remote (Remote page)
└── ngrok exposes EVERYTHING on port 3000 ❌
```

### After (New)
```
Laptop:
┌─────────────────────────────────────────┐
│ Main Kiosk (port 3000) - LOCAL ONLY    │
│ - Avatar                                 │
│ - React Three Fiber                      │
│ - 3D rendering                           │
│ - Lipsync                                │
│ - Visemes                                │
│ - Audio playback                         │
│ - Debug panel                            │
│ ✅ NOT exposed publicly                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Remote Controller (port 3001)           │
│ - Standalone Vite app                    │
│ - Push-to-talk button                    │
│ - Persona selector                       │
│ - Transcript                             │
│ - Language selector                      │
│ ✅ ONLY this is exposed via ngrok        │
└─────────────────────────────────────────┘

Backend (port 8000)
├── /ws/remote ← Remote connects here
└── /ws ← Kiosk connects here
```

---

## What Changed

### New Files Created

1. **`remote-controller/` directory** - Completely standalone application
   - `package.json` - Vite dev server (minimal dependencies)
   - `index.html` - Single page HTML
   - `styles.css` - All styles (no CSS framework needed)
   - `main.js` - WebSocket, microphone, and UI logic
   - `.env` - Backend configuration
   - `.env.example` - Template for environment variables
   - `.gitignore` - Standard Node.js gitignore
   - `README.md` - Complete documentation

### Unchanged Files

✅ **Everything in `frontend/`** - The main kiosk remains completely untouched  
✅ **Everything in `backend/`** - The AI pipeline remains completely untouched  
✅ All avatar rendering, lipsync, visemes, and 3D code - Unchanged  
✅ All existing WebSocket protocols - Unchanged  
✅ All AI providers (STT, TTS, LLM) - Unchanged  

---

## How It Works

### Communication Flow

```
Phone
  ↓
Remote Controller (port 3001)
  ↓ WebSocket
Backend /ws/remote
  ↓ AI Pipeline (STT → LLM → TTS → visemes)
  ↓ Relay
Laptop Kiosk /ws
  ↓
Avatar renders and speaks
```

### Key Points

1. **Separate Applications**: Remote and kiosk are two different apps
2. **Different Ports**: Remote (3001), Kiosk (3000)
3. **Different WebSocket Endpoints**: Remote uses `/ws/remote`, kiosk uses `/ws`
4. **Relay Pattern**: Backend relays remote input to kiosk displays
5. **No Duplication**: Remote reuses existing backend infrastructure

---

## Running the System

### Option 1: Everything Local (Development)

```powershell
# Terminal 1: Backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Main Kiosk (stays local)
cd frontend
npm run dev
# Runs on http://localhost:3000

# Terminal 3: Remote Controller
cd remote-controller
npm run dev
# Runs on http://localhost:3001
```

**Access:**
- Laptop: `http://localhost:3000` (kiosk)
- Phone (same WiFi): `http://192.168.0.9:3001` (remote)

---

### Option 2: Remote Exposed via ngrok (Production)

```powershell
# Terminal 1: Backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Tunnel backend ONLY
ngrok http 8000
# Copy the URL: https://abc123.ngrok-free.app

# Terminal 3: Remote Controller (configure .env first)
cd remote-controller
# Edit .env with the ngrok backend URL
npm run dev

# Terminal 4: Tunnel ONLY the remote
ngrok http 3001
# Copy the URL: https://def456.ngrok-free.app

# Terminal 5: Main Kiosk (stays local)
cd frontend
npm run dev
# Access ONLY on laptop: http://localhost:3000
```

**Access:**
- Laptop: `http://localhost:3000` (kiosk - local only)
- Phone (anywhere): `https://def456.ngrok-free.app` (remote - public)

---

## Current Running Configuration

### Services Currently Running

✅ **Backend** - Port 8000  
  - ngrok: `https://012a-103-105-178-99.ngrok-free.app`

✅ **Main Kiosk** - Port 3000 (LOCAL ONLY)  
  - Access: `http://localhost:3000`
  - ❌ NOT tunneled, NOT exposed

✅ **Remote Controller** - Port 3001  
  - ngrok: `https://b4eb-103-105-178-99.ngrok-free.app`
  - ✅ Connected to backend via `.env` configuration

### Open on Your Phone

```
https://b4eb-103-105-178-99.ngrok-free.app
```

This is **ONLY** the remote controller - no avatar, no 3D, just push-to-talk.

### Open on Your Laptop

```
http://localhost:3000
```

This shows the full kiosk with the 3D avatar.

---

## Configuration

### Remote Controller Environment Variables

File: `remote-controller/.env`

```env
VITE_BACKEND_WS_URL=wss://012a-103-105-178-99.ngrok-free.app/ws/remote
VITE_BACKEND_API_URL=https://012a-103-105-178-99.ngrok-free.app
```

**Auto-detection:** If these are not set, the remote will try to connect to `ws://localhost:8000/ws/remote` automatically based on the page's hostname.

---

## Feature Comparison

| Feature | Remote Controller | Main Kiosk |
|---------|-------------------|------------|
| **3D Avatar** | ❌ No | ✅ Yes |
| **Push-to-talk** | ✅ Yes | ✅ Yes |
| **Transcript** | ✅ Yes | ✅ Yes |
| **Audio playback** | ❌ No | ✅ Yes |
| **Viseme rendering** | ❌ No | ✅ Yes |
| **Persona selector** | ✅ Yes | ✅ Yes |
| **Language selector** | ✅ Yes | ✅ Yes |
| **Connection status** | ✅ Yes | ✅ Yes |
| **Debug panel** | ❌ No | ✅ Yes |
| **R3F/Three.js** | ❌ No | ✅ Yes |
| **Port** | 3001 | 3000 |
| **WebSocket** | `/ws/remote` | `/ws` |
| **Public access** | ✅ Yes (via ngrok) | ❌ No (local only) |

---

## Technology Stack

### Remote Controller
- **Runtime**: Browser (vanilla JS ES6+)
- **Build tool**: Vite 5
- **Dependencies**: None (only Vite as dev dependency)
- **Size**: ~15KB HTML + CSS + JS combined
- **Framework**: None (plain HTML/CSS/JS)

### Main Kiosk (Unchanged)
- Next.js 16 + React 19
- React Three Fiber + drei
- Zustand
- Framer Motion
- TypeScript

---

## Security

### Exposed Services

✅ **Remote Controller** - Safe to expose publicly
  - No sensitive data
  - No API keys
  - No backend credentials
  - Read-only persona data
  - User microphone input only

❌ **Main Kiosk** - Must remain local
  - Contains debug panels
  - May contain sensitive UI
  - Performance-intensive 3D rendering
  - Not designed for public access

✅ **Backend** - Exposed via ngrok
  - Already secured with proper CORS
  - API keys stored server-side only
  - Rate limiting via providers

---

## Troubleshooting

### Remote can't connect to backend

**Check:**
1. Backend is running on port 8000
2. Backend ngrok tunnel is active
3. `.env` file has correct ngrok URLs
4. WebSocket endpoint is `/ws/remote` (not `/ws`)

**Solution:**
```powershell
cd remote-controller
cat .env
# Verify URLs match the backend ngrok tunnel
```

### Microphone not working

**Cause:** Browser requires HTTPS for mic access

**Solution:**
- Use ngrok (provides HTTPS automatically)
- OR use localhost directly (no tunnel needed)
- OR set up proper SSL certificates

### Avatar not responding to remote input

**Check:**
1. Backend is running
2. Kiosk is open on laptop at `http://localhost:3000`
3. Backend logs show relay working

**The avatar MUST be open on the laptop** - it's the render target.

### Remote shows "Connect to start" forever

**Cause:** Backend is not reachable

**Solution:**
1. Check backend is running: `http://localhost:8000/health`
2. Check ngrok tunnel: visit the ngrok URL in browser
3. Check CORS: backend must allow remote's origin

---

## Maintenance

### When ngrok URLs change

ngrok free tier generates new URLs on each restart.

**Steps:**
1. Note the new backend ngrok URL
2. Update `remote-controller/.env`:
   ```env
   VITE_BACKEND_WS_URL=wss://NEW-URL.ngrok-free.app/ws/remote
   VITE_BACKEND_API_URL=https://NEW-URL.ngrok-free.app
   ```
3. Restart remote: `npm run dev`

### Adding new features to remote

Edit these files:
- `remote-controller/main.js` - Logic
- `remote-controller/styles.css` - Styling
- `remote-controller/index.html` - Markup

No build step needed - Vite hot-reloads automatically.

---

## File Changes Summary

### Created
- `remote-controller/` - Entire new directory
  - `package.json`
  - `index.html`
  - `styles.css`
  - `main.js`
  - `.env`
  - `.env.example`
  - `.gitignore`
  - `README.md`
- `REMOTE_CONTROLLER_SETUP.md` - This file

### Modified
- None (main kiosk and backend completely untouched)

### Deleted
- None

---

## Benefits

✅ **Security**: Only the remote is exposed, not the full kiosk  
✅ **Performance**: Remote is lightweight (~15KB), no 3D rendering overhead  
✅ **Separation**: Kiosk and remote are independent  
✅ **Maintenance**: Changes to remote don't affect kiosk  
✅ **Flexibility**: Can deploy remote separately from kiosk  
✅ **Mobile-first**: Remote is optimized for touch and small screens  

---

## Next Steps

1. Test the remote on your phone: `https://b4eb-103-105-178-99.ngrok-free.app`
2. Verify the kiosk works locally: `http://localhost:3000`
3. Speak into the remote and watch the laptop avatar respond
4. Adjust styling/layout in `remote-controller/styles.css` if needed

The system is now fully operational with complete separation between remote and kiosk.
