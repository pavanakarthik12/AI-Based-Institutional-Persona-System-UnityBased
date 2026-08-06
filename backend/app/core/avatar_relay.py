"""Fan-out relay from a remote talker to the avatar display(s).

A phone pushes audio over /ws/remote; the backend runs that through the exact same
pipeline the laptop uses and then delivers the resulting avatar-facing messages
(transcript, audio, visemes, metadata) to whichever /ws avatar connections are open.

/ws/remote and /ws remain fully independent sockets. The relay only converges their
output for display, and it does so additively: the existing /ws path is unchanged.
"""

import json
import logging

logger = logging.getLogger(__name__)


class _Relay:
    def __init__(self) -> None:
        self._displays: set[object] = set()
        self._remotes: set[object] = set()

    def register_display(self, websocket: object) -> None:
        """Called when an avatar /ws client connects."""
        self._displays.add(websocket)
        # Notify the newly connected display of current remote status
        if self._remotes:
            payload = {"type": "remote_status", "connected": True, "count": len(self._remotes)}
            import asyncio
            asyncio.create_task(self._send_to_display(websocket, payload))

    def unregister_display(self, websocket: object) -> None:
        """Called when an avatar /ws client goes away."""
        self._displays.discard(websocket)

    def register_remote(self, websocket: object) -> None:
        """Called when a remote /ws/remote client connects."""
        self._remotes.add(websocket)
        # Notify all displays that a remote connected
        payload = {"type": "remote_status", "connected": True, "count": len(self._remotes)}
        logger.info(f"Remote connected. Total remotes: {len(self._remotes)}")
        # Use asyncio to push without blocking
        import asyncio
        asyncio.create_task(self.push_to_displays(payload))

    def unregister_remote(self, websocket: object) -> None:
        """Called when a remote /ws/remote client goes away."""
        self._remotes.discard(websocket)
        # Notify all displays that a remote disconnected
        payload = {"type": "remote_status", "connected": len(self._remotes) > 0, "count": len(self._remotes)}
        logger.info(f"Remote disconnected. Total remotes: {len(self._remotes)}")
        import asyncio
        asyncio.create_task(self.push_to_displays(payload))

    async def _send_to_display(self, websocket: object, payload: dict) -> None:
        """Send a message to a single display."""
        text = json.dumps(payload)
        try:
            await websocket.send_text(text)  # type: ignore[attr-defined]
        except Exception:
            self.unregister_display(websocket)

    async def push_to_displays(self, payload: dict) -> None:
        """Send one message to every connected avatar, dropping the dead ones."""
        if not self._displays:
            return
        text = json.dumps(payload)
        dead: list[object] = []
        for websocket in list(self._displays):
            try:
                await websocket.send_text(text)  # type: ignore[attr-defined]
            except Exception:
                dead.append(websocket)
        for websocket in dead:
            self.unregister_display(websocket)


relay = _Relay()