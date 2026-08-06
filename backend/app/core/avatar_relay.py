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

    def register_display(self, websocket: object) -> None:
        """Called when an avatar /ws client connects."""
        self._displays.add(websocket)

    def unregister_display(self, websocket: object) -> None:
        """Called when an avatar /ws client goes away."""
        self._displays.discard(websocket)

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