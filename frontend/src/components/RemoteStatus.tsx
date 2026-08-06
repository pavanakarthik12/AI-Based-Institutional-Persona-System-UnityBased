"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * Small indicator showing whether a mobile remote controller is currently connected.
 * Only shows when a remote is active, stays hidden otherwise for minimal UI clutter.
 */
export const RemoteStatus = () => {
  const remoteConnected = useAppStore((state) => state.remoteConnected);

  if (!remoteConnected) {
    return null;
  }

  return (
    <div className="remote-status-badge" role="status" aria-live="polite">
      <span className="remote-status-dot" aria-hidden="true" />
      <span className="remote-status-label">Remote Connected</span>
    </div>
  );
};
