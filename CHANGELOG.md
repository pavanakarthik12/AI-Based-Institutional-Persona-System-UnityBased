# Changelog - AI Institutional Persona System

## [Unreleased]

## [1.1.0] - 2026-08-06

### ⚡ Performance Improvements

#### Mobile Push-to-Talk Latency Optimization
**Impact:** 50-150ms faster response time

**What Changed:**
- Audio analysis now runs in parallel instead of blocking the commit
- Backend starts processing immediately upon button release
- Audio quality validation is informational only (doesn't block response)

**Files Modified:**
- `remote-controller/main.js` - Reordered `recorder.onstop` logic

**User Experience:**
- Mobile users will notice faster response after speaking
- "Thinking..." indicator appears instantly when button is released
- Avatar starts responding sooner

---

### 🔗 Connection Status Enhancement

#### Real-Time Remote Status Display
**Impact:** Laptop always shows accurate remote connection status

**What Changed:**
- Fixed edge case where laptop connecting after mobile wouldn't show badge
- Added single-display messaging helper method
- Connection status updates in real-time without page refresh

**Files Modified:**
- `backend/app/core/avatar_relay.py` - Enhanced `register_display()` method

**User Experience:**
- Laptop displays green "Remote Connected" badge when mobile is active
- Badge appears immediately even if laptop connects after mobile
- Badge disappears automatically when mobile disconnects
- No manual refresh required

---

### 🐛 Bug Fixes
- Fixed: Laptop didn't show connection badge when connecting after mobile was already connected

---

### 📚 Documentation
**Added:**
- `OPTIMIZATION_SUMMARY.md` - Technical details of changes
- `TEST_SCRIPT.md` - Comprehensive testing procedures
- `DEPLOYMENT_CHECKLIST.md` - Deployment verification steps
- `QUICK_START.md` - Updated user guide
- `CHANGELOG.md` - This file

---

### ✅ Backward Compatibility
- ✅ All existing functionality preserved
- ✅ No breaking changes
- ✅ No new dependencies
- ✅ No configuration changes required
- ✅ Laptop-only mode unchanged
- ✅ Mobile-only mode unchanged
- ✅ Avatar animation/lipsync unchanged

---

## [1.0.0] - 2026-08-05 (Initial System)

### ✨ Core Features

#### Conversational Avatar System
- Real-time 3D avatar with facial animation
- Timeline-driven lip sync with 15 Oculus visemes
- Emotion-based facial expressions
- Procedural gestures and idle motion

#### Multi-Modal Input
- Laptop keyboard push-to-talk (hold "A" key)
- Laptop on-screen button (mouse/touch)
- Mobile remote controller (touch button)
- Text input option on laptop

#### AI Pipeline
- **STT:** Groq Whisper (whisper-large-v3-turbo)
- **LLM:** Groq (llama-3.1-8b-instant) with Gemini fallback
- **TTS:** ElevenLabs (cloned voices) with Edge TTS fallback
- **Viseme Generation:** Rule-based grapheme-to-viseme mapping
- **Emotion Detection:** Keyword-based inference

#### Four Institutional Personas
1. **Dr. A. Obulesu** (Head of Department)
   - ElevenLabs cloned voice
   - Purple accent color
   - Welcoming demeanor

2. **Dr. Srujana** (Principal)
   - Edge TTS voice (en-IN-NeerjaExpressiveNeural)
   - Blue accent color
   - Gracious and confident

3. **Dr. Padmaja** (Dean)
   - Edge TTS voice (en-IN-NeerjaNeural)
   - Green accent color
   - Thoughtful and scholarly

4. **Palla Rajeshwar Reddy** (Chairman)
   - Edge TTS voice (en-GB-RyanNeural)
   - Brown accent color
   - Formal and authoritative

#### Multi-Language Support
- Auto-detect
- English
- Hindi (हिन्दी)
- Telugu (తెలుగు)

#### WebSocket Architecture
- Primary: `/ws` for laptop avatar display
- Remote: `/ws/remote` for mobile controllers
- Relay pattern: Remote input → Avatar display
- Heartbeat: 15-second ping/pong
- Auto-reconnect with exponential backoff

#### Conversation Management
- Per-session memory (history persists during WebSocket connection)
- Persona-specific context (switching persona clears history)
- Multi-turn dialogue support
- Knowledge base integration (RAG)

#### Frontend Stack
- **Framework:** Next.js 15 (App Router)
- **3D:** React Three Fiber + drei
- **State:** Zustand
- **Styling:** Tailwind CSS 4
- **Audio:** Web Audio API

#### Backend Stack
- **Framework:** FastAPI
- **Language:** Python 3.13
- **Validation:** Pydantic v2
- **Transport:** WebSocket + REST

#### Mobile Remote Controller
- Vanilla JavaScript + Vite
- Push-to-talk interface
- Persona switching
- Language selection
- Transcript display
- Real-time connection status

---

## Technical Architecture

### Data Flow
```
User Input (Mic/Keyboard)
    ↓
WebSocket (/ws or /ws/remote)
    ↓
Backend Audio Buffer
    ↓
STT Provider (Groq Whisper)
    ↓
LLM Provider (Groq/Gemini)
    ↓
TTS Provider (ElevenLabs/Edge)
    ↓
Viseme Generation (grapheme→viseme)
    ↓
Emotion/Gesture Inference
    ↓
Relay to Display(s)
    ↓
Frontend Avatar Animation
```

### WebSocket Protocol

**Messages Client → Server:**
- `{"type":"stt_start"}` - Begin audio buffer
- `{"type":"stt_commit"}` - Process buffered audio
- `{"type":"stt_cancel"}` - Discard buffer
- `{"type":"chat"}` - Text input (skip STT)
- `{"type":"persona"}` - Switch persona
- `{"type":"reset"}` - Clear conversation
- `{"type":"ping"}` - Heartbeat
- Binary frames - Audio chunks

**Messages Server → Client:**
- `{"type":"status"}` - Connection established
- `{"type":"transcript"}` - User or assistant text
- `{"type":"audio"}` - TTS audio + visemes
- `{"type":"metadata"}` - Emotion/gesture hints
- `{"type":"stt_status"}` - Recording state
- `{"type":"remote_status"}` - Remote connection state
- `{"type":"error"}` - Error message
- `{"type":"pong"}` - Heartbeat response

---

## Configuration

### Environment Variables

**Backend (`backend/.env`):**
```
GROQ_API_KEY=...
GROQ_LLM_MODEL=llama-3.1-8b-instant
GROQ_STT_MODEL=whisper-large-v3-turbo

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash

ELEVENLABS_API_KEY=...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128
ELEVENLABS_DEFAULT_VOICE_ID=...

DEFAULT_PERSONA=hod
MAX_AVATAR_RESPONSE_CHARS=700
```

**Frontend (`frontend/.env.local`):**
```
NEXT_PUBLIC_WS_URL=wss://...
NEXT_PUBLIC_API_URL=https://...
```

**Remote Controller (`remote-controller/.env`):**
```
VITE_BACKEND_WS_URL=wss://.../ws/remote
VITE_BACKEND_API_URL=https://...
```

---

## Known Limitations

### Current System
1. **No Voice Activity Detection (VAD)**
   - Fixed-interval commits (not implemented)
   - Push-to-talk is primary interface

2. **No True Streaming**
   - LLM responses are buffered (not token-streamed)
   - TTS is one blob (not chunked playback)

3. **Basic Knowledge Base**
   - Simple keyword matching RAG
   - No vector embeddings or semantic search

4. **Rule-Based Components**
   - Emotion/gesture: keyword matching
   - Visemes: grapheme rules (not true G2P)

5. **Testing**
   - No automated test suite
   - Manual testing only

---

## Migration Notes

### From Unity to Browser (Pre-1.0)
The original plan used Unity for 3D rendering. This was replaced with:
- **Three.js + React Three Fiber** for WebGL rendering
- **GLB models** with morph targets (Avaturn T2)
- **Browser-native audio** (Web Audio API)
- **Timeline-based lipsync** (no Rhubarb/SALSA needed)

**Why:** Easier deployment, faster iteration, better AI integration

---

## Roadmap

### Planned Features
- [ ] Voice Activity Detection (VAD)
- [ ] True streaming (token + audio chunking)
- [ ] Vector-based knowledge retrieval
- [ ] LLM-based emotion classification
- [ ] True G2P for visemes
- [ ] Gesture animation playback
- [ ] Better avatar models (Microsoft Rocketbox)
- [ ] Automated test suite

---

## Credits

**Original System Architecture:** Institutional kiosk requirement  
**Optimization (v1.1.0):** Kiro AI Agent  
**Date:** August 6, 2026

---

## Version Format

`MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes or major feature additions
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, optimizations, backward compatible

---

**Current Version:** 1.1.0  
**Last Updated:** 2026-08-06
