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

## Installation

```bash
cd remote-controller
npm install
```

## Development

```bash
npm run dev
```

The app will run on `http://0.0.0.0:3001` (accessible from any device on your local network).

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

## Deployment with ngrok

To expose **only the remote controller** (not the main kiosk):

```bash
# Terminal 1: Run the remote
cd remote-controller
npm run dev

# Terminal 2: Tunnel only the remote
ngrok http 3001
```

The laptop kiosk on port 3000 remains local and is **not** exposed.

## Production Build

```bash
npm run build
npm run preview
```

## How It Works

1. User holds the talk button on their phone
2. Audio streams to the backend via WebSocket (`/ws/remote`)
3. Backend processes: STT → LLM → TTS → visemes
4. Results are relayed to the laptop kiosk avatar
5. The phone shows the conversation transcript

The phone **never** renders the 3D avatar — that stays on the laptop.

## File Structure

```
remote-controller/
├── index.html         # Main HTML page
├── styles.css         # All styles (no framework needed)
├── main.js            # WebSocket, mic, and UI logic
├── package.json       # Vite dev server only
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Browser Requirements

- Modern browser with WebSocket support
- Microphone access (requires HTTPS or localhost)
- ES6+ JavaScript support

## Troubleshooting

### Mic not working on mobile

The mic requires a secure context (HTTPS or localhost). If you're accessing the remote over `http://`, the browser will block mic access.

**Solution:** Use ngrok to get an HTTPS URL, or access via `https://` with a proper SSL cert.

### Can't connect to backend

Check that:
1. The FastAPI backend is running on port 8000
2. The backend is accessible from your device's network
3. CORS is configured to allow your remote's origin
4. The WebSocket endpoint is `/ws/remote` (not `/ws`)

### Connection keeps dropping

The remote automatically reconnects after 2 seconds. If reconnections keep failing, check your network and backend logs.

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
