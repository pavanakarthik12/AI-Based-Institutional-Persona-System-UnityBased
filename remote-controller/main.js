// ============================================================================
// Configuration
// ============================================================================

// Backend URL - auto-detects from environment or uses localhost
const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || getDefaultBackendWsUrl();
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || getDefaultBackendApiUrl();

function getDefaultBackendWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  return `${protocol}//${host}:8000/ws/remote`;
}

function getDefaultBackendApiUrl() {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = window.location.hostname;
  return `${protocol}//${host}:8000`;
}

// ============================================================================
// State
// ============================================================================

const state = {
  socket: null,
  socketStatus: 'connecting',
  personas: [],
  activePersonaId: null,
  language: 'auto',
  entries: [],
  thinking: false,
  
  // Microphone
  listening: false,
  micPermission: 'prompt',
  micState: 'idle',
  micError: null,
  mediaRecorder: null,
  mediaStream: null,
  sentAnyAudio: false,
  chunks: [],
};

// ============================================================================
// WebSocket Manager
// ============================================================================

function connectWebSocket() {
  if (state.socket) {
    state.socket.close();
  }
  
  updateConnectionStatus('connecting');
  
  const socket = new WebSocket(BACKEND_WS_URL);
  state.socket = socket;
  
  socket.onopen = () => {
    console.log('[WS] Connected');
    updateConnectionStatus('open');
    startHeartbeat();
  };
  
  socket.onclose = () => {
    console.log('[WS] Disconnected');
    updateConnectionStatus('closed');
    stopHeartbeat();
    setTimeout(connectWebSocket, 2000);
  };
  
  socket.onerror = (error) => {
    console.error('[WS] Error:', error);
    updateConnectionStatus('error');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('[WS] Failed to parse message:', error);
    }
  };
}

function sendJson(payload) {
  if (state.socket && state.socket.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify(payload));
    return true;
  }
  return false;
}

function sendBinary(blob) {
  if (state.socket && state.socket.readyState === WebSocket.OPEN) {
    state.socket.send(blob);
    return true;
  }
  return false;
}

let heartbeatInterval = null;

function startHeartbeat() {
  if (heartbeatInterval) return;
  heartbeatInterval = setInterval(() => {
    sendJson({ type: 'ping' });
  }, 15000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'status':
      if (data.persona) {
        state.activePersonaId = data.persona;
        renderPersonas();
      }
      break;
      
    case 'stt_status':
      if (data.state === 'processing') {
        state.thinking = true;
        renderTranscript();
      } else if (['complete', 'empty', 'error'].includes(data.state)) {
        state.thinking = false;
        renderTranscript();
      }
      break;
      
    case 'transcript':
      if (data.role === 'user' && data.text) {
        addEntry('user', data.text);
      }
      break;
      
    case 'response':
      state.thinking = false;
      if (data.text) {
        addEntry('assistant', data.text);
      }
      renderTranscript();
      break;
      
    case 'error':
      state.thinking = false;
      if (data.message) {
        addEntry('system', data.message);
      }
      renderTranscript();
      break;
      
    default:
      break;
  }
}

function updateConnectionStatus(status) {
  state.socketStatus = status;
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const talkButton = document.getElementById('talkButton');
  const talkLabel = document.getElementById('talkLabel');
  
  if (status === 'open') {
    dot.classList.add('online');
    statusText.textContent = 'Connected';
    statusText.classList.add('ok');
    talkButton.disabled = false;
    updateTalkButtonLabel();
  } else {
    dot.classList.remove('online');
    statusText.classList.remove('ok');
    talkButton.disabled = true;
    
    if (status === 'connecting') {
      statusText.textContent = 'Connecting…';
      talkLabel.textContent = 'Connecting…';
    } else {
      statusText.textContent = 'Disconnected';
      talkLabel.textContent = 'Connect to start';
    }
  }
}

// ============================================================================
// Personas
// ============================================================================

async function loadPersonas() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/personas`);
    if (!response.ok) {
      throw new Error(`Failed to load personas: ${response.status}`);
    }
    const data = await response.json();
    state.personas = data.personas || [];
    
    if (!state.activePersonaId && data.default) {
      state.activePersonaId = data.default;
    } else if (!state.activePersonaId && state.personas.length > 0) {
      state.activePersonaId = state.personas[0].id;
    }
    
    renderPersonas();
    
    if (state.activePersonaId) {
      sendJson({ type: 'persona', persona: state.activePersonaId });
    }
  } catch (error) {
    console.error('[Personas] Failed to load:', error);
  }
}

function renderPersonas() {
  const strip = document.getElementById('personaStrip');
  
  strip.innerHTML = state.personas.map(persona => `
    <button 
      type="button" 
      class="persona-chip ${persona.id === state.activePersonaId ? 'active' : ''}"
      style="--persona-accent: ${persona.accent_color || '#6366f1'}"
      data-persona="${persona.id}"
      aria-pressed="${persona.id === state.activePersonaId}"
    >
      ${persona.display_name}
    </button>
  `).join('');
  
  strip.querySelectorAll('.persona-chip').forEach(button => {
    button.addEventListener('click', () => {
      const personaId = button.dataset.persona;
      if (personaId === state.activePersonaId) return;
      
      state.activePersonaId = personaId;
      sendJson({ type: 'persona', persona: personaId });
      renderPersonas();
    });
  });
}

// ============================================================================
// Transcript
// ============================================================================

function addEntry(role, text) {
  state.entries.push({
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  });
  
  // Keep last 20 entries
  if (state.entries.length > 20) {
    state.entries = state.entries.slice(-20);
  }
  
  renderTranscript();
}

function renderTranscript() {
  const transcript = document.getElementById('transcript');
  const emptyState = document.getElementById('emptyState');
  
  if (state.entries.length === 0 && !state.thinking) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  const html = state.entries.map(entry => `
    <p class="entry ${entry.role}">
      ${escapeHtml(entry.text)}
    </p>
  `).join('');
  
  const thinkingHtml = state.thinking ? `
    <p class="entry thinking">
      <span class="typing-dots" aria-hidden="true"></span>
      Thinking…
    </p>
  ` : '';
  
  transcript.innerHTML = html + thinkingHtml;
  
  // Auto-scroll to bottom
  transcript.scrollTop = transcript.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Microphone
// ============================================================================

const CHUNK_MS = 500; // 500ms chunk size - balanced for streaming efficiency
const MIN_RECORDING_SECONDS = 0.55; // Informational threshold, not blocking
const MIN_RMS = 0.012; // Informational threshold, not blocking

function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
  ];
  return candidates.find(type => MediaRecorder.isTypeSupported(type));
}

async function startRecording() {
  if (state.mediaRecorder || state.listening) return;
  
  // Check secure context
  if (!window.isSecureContext) {
    state.micPermission = 'denied';
    const currentUrl = window.location.href;
    const httpsUrl = currentUrl.replace(/^http:/, 'https:');
    state.micError = `Microphone requires HTTPS. Try opening: ${httpsUrl}`;
    state.micState = 'error';
    showMicError(state.micError);
    
    const notice = document.getElementById('insecureNotice');
    notice.innerHTML = `
      The microphone needs a secure context (HTTPS or localhost). 
      Your connection is not secure, so the talk button cannot record audio.
      <br><br>
      <strong>Open this URL instead:</strong><br>
      <a href="${httpsUrl}" style="color: #60a5fa; text-decoration: underline;">${httpsUrl}</a>
    `;
    notice.classList.remove('hidden');
    return;
  }
  
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    state.micPermission = 'error';
    state.micError = 'Browser does not support microphone recording.';
    state.micState = 'error';
    showMicError(state.micError);
    return;
  }
  
  try {
    state.micState = 'requesting_permission';
    updateTalkButtonLabel();
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    
    state.mediaStream = stream;
    state.micPermission = 'granted';
    state.micError = null;
    hideMicError();
    
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: 128_000,
    });
    
    state.mediaRecorder = recorder;
    state.sentAnyAudio = false;
    state.chunks = [];
    
    const contentType = (mimeType || 'audio/webm').split(';')[0];
    const filename = contentType.includes('ogg') ? 'audio.ogg' : 'audio.webm';
    
    sendJson({
      type: 'stt_start',
      content_type: contentType,
      filename,
      language: state.language,
      persona: state.activePersonaId,
      include_audio: true,
    });
    
    recorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;
      state.chunks.push(event.data);
      if (sendBinary(event.data)) {
        state.sentAnyAudio = true;
      }
    };
    
    recorder.onstart = () => {
      state.micState = 'recording';
      state.listening = true;
      updateTalkButton();
    };
    
    recorder.onerror = () => {
      state.micPermission = 'error';
      state.micError = 'Recorder error';
      state.micState = 'error';
      showMicError('Recorder error');
      cleanupRecorder();
    };
    
    recorder.onstop = async () => {
      // Commit immediately for fastest response, then validate in parallel
      if (state.sentAnyAudio) {
        // Send commit right away - don't wait for validation
        sendJson({ type: 'stt_commit' });
        hideMicError();
        
        // Validate audio quality in background (for future improvements/logging)
        const recording = new Blob(state.chunks, { type: mimeType || contentType });
        analyzeAudio(recording).then(analysis => {
          // If audio was too short/quiet, we've already committed - backend will handle it
          // This analysis is now informational only, doesn't block the response
          if (analysis && (analysis.duration < MIN_RECORDING_SECONDS || analysis.rms < MIN_RMS)) {
            console.warn('[Audio] Quality below threshold:', analysis);
          }
        }).catch(() => {
          // Analysis failure doesn't affect the already-sent commit
        });
      } else {
        sendJson({ type: 'stt_cancel' });
        showMicError('No audio captured from microphone.');
        state.micState = 'idle';
        updateTalkButtonLabel();
      }
      
      state.listening = false;
      state.chunks = [];
      updateTalkButton();
      cleanupRecorder();
    };
    
    recorder.start(CHUNK_MS);
    
  } catch (error) {
    const denied = error.name === 'NotAllowedError' || error.name === 'SecurityError';
    state.micPermission = denied ? 'denied' : 'error';
    state.micError = error.name === 'NotFoundError' 
      ? 'No microphone device found.' 
      : 'Microphone permission denied';
    state.micState = 'error';
    state.listening = false;
    showMicError(state.micError);
    updateTalkButton();
    cleanupRecorder();
  }
}

function stopRecording() {
  if (!state.mediaRecorder || state.mediaRecorder.state === 'inactive') return;
  
  // Immediately signal commit to backend for faster response
  // The onstop handler will still run to validate audio quality
  if (state.sentAnyAudio) {
    state.micState = 'processing';
    updateTalkButtonLabel();
  }
  
  state.mediaRecorder.stop();
}

function cleanupRecorder() {
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach(track => track.stop());
    state.mediaStream = null;
  }
  state.mediaRecorder = null;
}

async function analyzeAudio(blob) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    
    const context = new AudioContext();
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    
    let sum = 0;
    let samples = 0;
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
      }
      samples += data.length;
    }
    
    await context.close();
    
    return {
      duration: buffer.duration,
      rms: samples > 0 ? Math.sqrt(sum / samples) : 0,
    };
  } catch {
    return null;
  }
}

function updateTalkButton() {
  const button = document.getElementById('talkButton');
  const micBlocked = state.micPermission === 'denied' || state.micPermission === 'error';
  
  button.classList.toggle('recording', state.listening);
  button.classList.toggle('blocked', micBlocked);
  button.disabled = state.socketStatus !== 'open';
  
  updateTalkButtonLabel();
}

function updateTalkButtonLabel() {
  const label = document.getElementById('talkLabel');
  const micBlocked = state.micPermission === 'denied' || state.micPermission === 'error';
  
  if (state.socketStatus !== 'open') {
    label.textContent = 'Connect to start';
  } else if (micBlocked) {
    label.textContent = 'Mic unavailable';
  } else if (state.listening) {
    label.textContent = 'Release to send';
  } else if (state.thinking) {
    label.textContent = 'Thinking...';
  } else if (state.micState === 'requesting_permission') {
    label.textContent = 'Requesting mic...';
  } else {
    label.textContent = 'Hold to talk';
  }
}

function showMicError(message) {
  const errorEl = document.getElementById('micError');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function hideMicError() {
  const errorEl = document.getElementById('micError');
  errorEl.classList.add('hidden');
}

// ============================================================================
// Language Selection
// ============================================================================

function setupLanguagePills() {
  const pills = document.querySelectorAll('.lang-pill');
  
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const lang = pill.dataset.lang;
      if (lang === state.language) return;
      
      state.language = lang;
      
      pills.forEach(p => {
        p.classList.toggle('active', p.dataset.lang === lang);
        p.setAttribute('aria-checked', p.dataset.lang === lang);
      });
    });
  });
}

// ============================================================================
// Talk Button
// ============================================================================

function setupTalkButton() {
  const button = document.getElementById('talkButton');
  
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    startRecording();
  });
  
  button.addEventListener('pointerup', () => {
    stopRecording();
  });
  
  button.addEventListener('pointercancel', () => {
    stopRecording();
  });
  
  button.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

// ============================================================================
// Initialize
// ============================================================================

function init() {
  console.log('[Remote] Initializing...');
  console.log('[Remote] Backend WS:', BACKEND_WS_URL);
  console.log('[Remote] Backend API:', BACKEND_API_URL);
  
  setupLanguagePills();
  setupTalkButton();
  connectWebSocket();
  loadPersonas();
}

// Start the app
init();
