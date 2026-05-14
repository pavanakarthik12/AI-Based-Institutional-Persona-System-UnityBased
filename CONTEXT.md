
# AI Institutional Persona System — Backend Context / PRD

## Project Vision

We are building an AI-powered institutional digital human system for college/demo/kiosk use.

The first persona/avatar is the HOD. Later the system should support multiple institutional personas such as:
- HOD
- Chairman
- Reception Assistant
- Faculty Member
- Department Guide

The goal is to create an interactive AI persona that can:
- listen to user speech
- understand questions
- respond using an LLM
- speak using cloned or natural voice
- animate a 3D avatar in Unity
- support future multilingual interactions

This is NOT a video-generation system.
This is a realtime digital human / AI avatar assistant system.

---

## Current Direction

We previously experimented with:
- Three.js / React avatar frontend
- Rhubarb lip sync
- browser speech synthesis
- D-ID / SadTalker / Wav2Lip style ideas

We are now moving to a better architecture:

```text
Unity Frontend
+
FastAPI AI Orchestration Backend
````

Unity will handle:

* 3D avatar rendering
* animations
* gestures
* emotions
* lipsync
* audio playback
* user-facing UI

Backend will handle:

* speech-to-text
* LLM response generation
* TTS generation / streaming
* persona prompts
* response metadata
* emotion / gesture hints
* API orchestration

---

## Important Architecture Decision

Do NOT use Rhubarb in the new backend.

Reason:
Rhubarb requires full audio generation, file saving, WAV conversion, phoneme extraction, and delayed playback.
That is not ideal for realtime conversational avatars.

Instead, the new backend should be streaming-first and Unity should handle realtime lipsync locally using:

* SALSA LipSync
* Oculus LipSync
* audio-driven blendshape systems
* future realtime viseme systems

Backend should NOT generate lip sync files.

---

## Backend Responsibilities

The backend should be a clean, standalone FastAPI service.

It should NOT be tightly coupled to:

* React frontend
* Unity scene implementation
* specific UI logic

It should expose clean APIs that any frontend can consume.

Primary backend responsibilities:

1. Receive user text or audio
2. Convert speech to text using STT
3. Generate persona-aware AI response
4. Generate voice/audio using TTS
5. Stream or return audio to Unity
6. Return metadata:

   * text response
   * persona
   * emotion hint
   * gesture hint
   * provider info
   * latency metrics

---

## Preferred Backend Stack

* Python
* FastAPI
* Pydantic
* dotenv / pydantic-settings
* Groq for fast LLM responses
* Gemini as fallback LLM provider
* Groq Whisper or equivalent for STT
* ElevenLabs for TTS and voice cloning
* Edge TTS only as fallback/dev mode
* Persona config using JSON

---

## Provider Strategy

All major AI services must be provider-based and swappable.

Backend should support:

### LLM Providers

* Groq primary
* Gemini fallback

### STT Providers

* Groq Whisper primary
* Browser/WebSpeech is NOT part of backend
* Future support: Deepgram / OpenAI / local Whisper

### TTS Providers

* ElevenLabs primary
* Edge TTS fallback for dev/testing

Provider selection should be controlled by `.env`.

Example:

```env
LLM_PROVIDER=groq
STT_PROVIDER=groq_whisper
TTS_PROVIDER=elevenlabs
```

---

## Streaming-First Philosophy

The backend should be designed for low perceived latency.

Preferred future flow:

```text
Unity records user speech
→ Backend STT
→ LLM streaming response
→ ElevenLabs streaming TTS
→ Unity plays audio as it arrives
→ Unity handles realtime lipsync locally
```

Initial version may return complete audio if streaming is complex, but the architecture should not block future streaming.

Avoid designs that depend on:

* temporary audio files as the main workflow
* offline phoneme generation
* precomputed video
* Rhubarb-style delayed lipsync

---

## Unity Integration Contract

Unity should eventually call backend endpoints like:

### Text chat

```http
POST /chat
```

### Speech-to-text

```http
POST /stt
```

### Text-to-speech

```http
POST /tts
```

### Full avatar response

```http
POST /avatar/respond
```

Expected final response shape:

```json
{
  "text": "Welcome to the Department of IT. How can I help you?",
  "persona": "hod",
  "audio_url": "optional",
  "audio_base64": "optional",
  "emotion": "welcoming",
  "gesture": "greeting",
  "llm_provider": "groq",
  "tts_provider": "elevenlabs",
  "latency": {
    "llm_ms": 420,
    "tts_ms": 900,
    "total_ms": 1450
  }
}
```

For streaming TTS, the backend may later expose:

* WebSocket endpoint
* Server-Sent Events endpoint
* chunked audio endpoint

---

## Persona System

Personas should be defined in JSON.

Each persona should include:

```json
{
  "id": "hod",
  "display_name": "HOD",
  "role": "Head of Department",
  "speaking_style": "professional, calm, concise, encouraging",
  "system_prompt": "You are the Head of Department speaking to students and visitors...",
  "voice_id": "ELEVENLABS_VOICE_ID_HERE",
  "default_emotion": "neutral",
  "default_gesture": "idle"
}
```

Response style should be:

* short
* spoken-friendly
* natural
* institutional
* not overly verbose
* suitable for avatar speech

Avoid long paragraphs.

---

## Emotion and Gesture Metadata

Backend should optionally classify or infer simple metadata from generated response.

Supported emotions:

* neutral
* welcoming
* happy
* thinking
* serious
* encouraging

Supported gestures:

* idle
* greeting
* explaining
* thinking
* nodding
* speaking

This metadata will help Unity choose animation states.

Backend does NOT animate directly.
Backend only sends hints.

---

## STT Requirements

Backend should support audio upload from Unity.

Initial endpoint:

```http
POST /stt
multipart/form-data
audio_file=<wav/mp3/webm>
language=auto
```

Expected output:

```json
{
  "transcript": "What are the placements in IT department?",
  "language": "en",
  "provider": "groq_whisper"
}
```

Multilingual support should be considered from the beginning.

Target languages:

* English
* Hindi
* Telugu
* mixed English/Hindi/Telugu if possible

---

## TTS Requirements

ElevenLabs is the main TTS provider.

Requirements:

* support voice IDs per persona
* support cloned voice
* support standard voice fallback
* return audio in a Unity-friendly format
* future support for streaming audio

Initial endpoint:

```http
POST /tts
```

Input:

```json
{
  "text": "Hello, welcome to our department.",
  "persona": "hod"
}
```

Output:

```json
{
  "audio_url": "optional",
  "audio_base64": "optional",
  "provider": "elevenlabs",
  "voice_id": "..."
}
```

Implementation may start with full audio response, but service should be written so streaming can be added later.

---

## LLM Requirements

Primary LLM provider should be Groq because fast response is important for avatar systems.

Gemini should be supported as fallback.

LLM output should be optimized for speech:

* concise
* clear
* friendly
* not too long
* no markdown unless specifically needed
* no huge lists during speech

The LLM provider should support both:

* complete response
* streaming response

---

## Backend Folder Structure

Recommended structure:

```text
backend/
  app/
    main.py
    config.py

    api/
      routes_health.py
      routes_chat.py
      routes_stt.py
      routes_tts.py
      routes_avatar.py

    core/
      pipeline.py
      errors.py
      logging_config.py

    models/
      chat_models.py
      stt_models.py
      tts_models.py
      avatar_models.py

    services/
      persona_service.py

      llm/
        base.py
        groq_provider.py
        gemini_provider.py

      stt/
        base.py
        groq_whisper_provider.py

      tts/
        base.py
        elevenlabs_provider.py
        edge_tts_provider.py

    data/
      personas.json

  requirements.txt
  .env.example
  README.md
```

---

## Main Backend Endpoints

### Health

```http
GET /health
```

Returns backend status and configured providers.

---

### Chat

```http
POST /chat
```

Input:

```json
{
  "message": "What are the department timings?",
  "persona": "hod"
}
```

Output:

```json
{
  "response": "...",
  "persona": "hod",
  "provider": "groq",
  "emotion": "neutral",
  "gesture": "explaining"
}
```

---

### STT

```http
POST /stt
```

Receives audio and returns transcript.

---

### TTS

```http
POST /tts
```

Receives text and persona, returns generated audio.

---

### Avatar Response

```http
POST /avatar/respond
```

Input:

```json
{
  "message": "Tell me about placements.",
  "persona": "hod"
}
```

Output:

```json
{
  "text": "...",
  "persona": "hod",
  "audio_url": "...",
  "emotion": "encouraging",
  "gesture": "explaining",
  "llm_provider": "groq",
  "tts_provider": "elevenlabs",
  "latency": {
    "total_ms": 0
  }
}
```

---

## What NOT To Do

Do NOT:

* integrate backend tightly into frontend
* put API keys in Unity
* use Rhubarb as core architecture
* generate full videos
* make UI-specific decisions in backend
* hardcode provider logic everywhere
* make responses too long
* require temp files for every stage unless unavoidable
* make Unity responsible for LLM/TTS API calls directly

---

## Immediate Development Goal

Build clean backend first.

Priority:

1. FastAPI structure
2. health endpoint
3. persona loading
4. Groq LLM provider
5. Gemini fallback provider
6. ElevenLabs TTS provider
7. Edge TTS fallback
8. Groq Whisper STT
9. /avatar/respond full pipeline
10. streaming upgrades later

---

## Success Criteria

Backend is successful if:

* Unity can call one endpoint and get a complete avatar response package
* Providers are swappable through `.env`
* API keys are never exposed to frontend/Unity
* Responses are fast and concise
* TTS works with ElevenLabs cloned voice
* STT supports uploaded audio
* Architecture is ready for streaming later