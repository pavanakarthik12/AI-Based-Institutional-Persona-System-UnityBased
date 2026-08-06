/**
 * Single source of truth for where the backend lives.
 *
 * The kiosk serves the page to a phone over the LAN, so hardcoding `localhost` breaks
 * mobile clients. Resolution order:
 *   1. Explicit env override (NEXT_PUBLIC_WS_URL / NEXT_PUBLIC_API_URL) when set
 *   2. The host the page itself was served from (window.location.hostname)
 * The scheme matches the page: http page -> ws://, https page -> wss:// (and https for
 * REST). Same-host assumption: the FastAPI backend runs beside the Next.js app.
 */

const BACKEND_PORT = 8000;

const isBrowser = () => typeof window !== "undefined";

const configuredBase = () => {
  const configured = process.env.NEXT_PUBLIC_WS_URL;
  if (configured) {
    return configured.replace(/\/ws$/, "");
  }
  return null;
};

/** ws://host:8000 or wss://host:8000 — no trailing path. */
export const wsBase = () => {
  const override = configuredBase();
  if (override) {
    return override.replace(/\/$/, "");
  }
  const host = isBrowser() ? window.location.hostname : "localhost";
  const scheme = isBrowser() && window.location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${host}:${BACKEND_PORT}`;
};

/** Full WebSocket endpoint, e.g. wsBase() + "/ws" or "/ws/remote". */
export const wsUrl = (path = "/ws") => `${wsBase()}${path}`;

/** REST base for the same backend, e.g. http(s)://host:8000. */
export const apiBase = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const host = isBrowser() ? window.location.hostname : "localhost";
  const scheme = isBrowser() ? window.location.protocol : "http:";
  return `${scheme}//${host}:${BACKEND_PORT}`;
};
