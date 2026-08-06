"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getSocketManager, type SocketStatus } from "@/lib/socketManager";
import { useMicrophoneStream } from "@/hooks/useMicrophoneStream";
import { useAppStore } from "@/store/useAppStore";
import { apiBase, wsUrl } from "@/lib/backendUrl";
import styles from "./remote.module.css";

type PersonaBrief = {
  id: string;
  display_name: string;
  role: string;
  accent_color: string;
};

type ChatEntry = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
};

type RemoteMessage = {
  type?: string;
  persona?: string;
  role?: "user" | "assistant" | "system";
  text?: string;
  message?: string;
  state?: string;
  provider?: string;
};

const LANGUAGES = [
  { value: "auto", label: "Auto" },
  { value: "en", label: "EN" },
  { value: "hi", label: "हि" },
  { value: "te", label: "తె" },
];

const subscribeInsecure = () => () => {};

const getInsecureSnapshot = () => typeof window !== "undefined" && !window.isSecureContext;

/**
 * Mobile remote controller: hold the big button, speak, release. The audio travels over
 * /ws/remote, runs through the same backend pipeline as the laptop, and the avatar page
 * renders the result — this screen only shows the conversation.
 */
export default function RemotePage() {
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [personas, setPersonas] = useState<PersonaBrief[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [language, setLanguage] = useState("auto");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [thinking, setThinking] = useState(false);
  const insecure = useSyncExternalStore(subscribeInsecure, getInsecureSnapshot, () => false);

  const listening = useAppStore((state) => state.listening);
  const micState = useAppStore((state) => state.micState);
  const micPermission = useAppStore((state) => state.micPermission);
  const micError = useAppStore((state) => state.micError);

  const pushEntry = useCallback((entry: Omit<ChatEntry, "id">) => {
    setEntries((prev) =>
      [...prev, { id: crypto.randomUUID(), ...entry }].slice(-20),
    );
  }, []);

  useEffect(() => {
    const manager = getSocketManager();
    const release = manager.acquire(wsUrl("/ws/remote"));
    const unsubscribeStatus = manager.onStatus(setStatus);

    const unsubscribeMessage = manager.onMessage((raw) => {
      if (typeof raw !== "string") {
        return;
      }
      let data: RemoteMessage;
      try {
        data = JSON.parse(raw) as RemoteMessage;
      } catch {
        return;
      }

      switch (data.type) {
        case "status":
          if (data.persona) {
            setActivePersonaId(data.persona);
          }
          break;

        case "stt_status":
          if (data.state === "processing") {
            setThinking(true);
          } else if (data.state === "complete" || data.state === "empty" || data.state === "error") {
            setThinking(false);
          }
          break;

        case "transcript":
          if (data.role === "user" && data.text) {
            pushEntry({ role: "user", text: data.text });
          }
          break;

        case "response":
          setThinking(false);
          if (data.text) {
            pushEntry({ role: "assistant", text: data.text });
          }
          break;

        case "error":
          setThinking(false);
          if (data.message) {
            pushEntry({ role: "system", text: data.message });
          }
          break;

        default:
          break;
      }
    });

    const controller = new AbortController();
    void fetch(`${apiBase()}/personas`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`personas request failed: ${response.status}`);
        }
        return response.json() as Promise<{ default: string; personas: PersonaBrief[] }>;
      })
      .then((data) => {
        const list = data.personas ?? [];
        setPersonas(list);
        const initial = list.find((persona) => persona.id === data.default)?.id ?? list[0]?.id;
        if (initial) {
          setActivePersonaId(initial);
        }
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          console.error("[remote] personas failed to load", error);
        }
      });

    return () => {
      controller.abort();
      unsubscribeStatus();
      unsubscribeMessage();
      release();
    };
  }, [pushEntry]);

  // Persona changes reuse the backend's persona-switch logic via a control message.
  useEffect(() => {
    if (!activePersonaId) {
      return;
    }
    getSocketManager().sendJson({ type: "persona", persona: activePersonaId });
  }, [activePersonaId]);

  const sendEvent = useCallback((payload: Record<string, unknown>) => {
    getSocketManager().sendJson(payload);
  }, []);

  const sendChunk = useCallback((blob: Blob) => getSocketManager().sendBinaryIfOpen(blob), []);

  const { start, stop } = useMicrophoneStream({
    sendChunk,
    sendEvent,
    persona: activePersonaId ?? undefined,
    language,
    includeAudio: true,
  });

  const micBlocked = micPermission === "denied" || micPermission === "error";
  const connected = status === "open";

  const buttonLabel = micBlocked
    ? "Mic unavailable"
    : listening
      ? "Release to send"
      : thinking
        ? "Thinking..."
        : micState === "requesting_permission"
          ? "Requesting mic..."
          : "Hold to talk";

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={`${styles.dot}${connected ? "" : ` ${styles.dotOffline}`}`} />
          <span className={styles.title}>Remote Talker</span>
        </div>
        <span className={`${styles.status}${connected ? ` ${styles.statusOk}` : ""}`}>
          {connected ? "Connected" : status === "connecting" ? "Connecting…" : "Disconnected"}
        </span>
      </header>

      {insecure ? (
        <div className={styles.notice} role="alert">
          The microphone needs a secure context, so the talk button cannot record here.
          Open this page over <strong>https://{typeof window !== "undefined" ? window.location.hostname : "…"}:3000/remote</strong>{" "}
          (or localhost) to talk. The connection still works on http://.
        </div>
      ) : null}

      <nav className={styles.personaStrip} aria-label="Persona">
        {personas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            className={`${styles.personaChip}${persona.id === activePersonaId ? ` ${styles.personaChipActive}` : ""}`}
            style={
              { "--persona-accent": persona.accent_color || "#6366f1" } as React.CSSProperties
            }
            onClick={() => setActivePersonaId(persona.id)}
            aria-pressed={persona.id === activePersonaId}
          >
            {persona.display_name}
          </button>
        ))}
      </nav>

      <div className={styles.transcript} aria-live="polite">
        {entries.length === 0 && !thinking ? (
          <p className={styles.empty}>Hold the button, speak, release. The avatar will answer.</p>
        ) : null}
        {entries.map((entry) => (
          <p key={entry.id} className={`${styles.entry} ${styles[`entry${entry.role}`]}`}>
            {entry.text}
          </p>
        ))}
        {thinking ? (
          <p className={`${styles.entry} ${styles.entryThinking}`}>
            <span className={styles.typingDots} aria-hidden="true" />
            Thinking…
          </p>
        ) : null}
      </div>

      {micError ? <p className={styles.micError}>{micError}</p> : null}

      <footer className={styles.footer}>
        <div className={styles.langPills} role="radiogroup" aria-label="Language">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={language === value}
              className={`${styles.langPill}${language === value ? ` ${styles.langPillActive}` : ""}`}
              onClick={() => setLanguage(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.talkButton}${listening ? ` ${styles.talkButtonRecording}` : ""}${micBlocked ? ` ${styles.talkButtonBlocked}` : ""}`}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            void start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onContextMenu={(event) => event.preventDefault()}
          disabled={!connected}
          aria-label="Hold to speak"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
            <path d="M19 11a7 7 0 0 1-14 0" />
            <path d="M12 18v3" />
          </svg>
          <span className={styles.talkLabel}>{connected ? buttonLabel : "Connect to start"}</span>
        </button>
      </footer>
    </div>
  );
}
