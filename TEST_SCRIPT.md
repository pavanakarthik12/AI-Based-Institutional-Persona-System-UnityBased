# Test Script - Mobile Remote Optimization

**Duration:** ~10 minutes  
**Required:** Phone + Laptop on same network (or use ngrok)  
**Objective:** Verify optimizations work correctly

---

## 🎬 Pre-Test Setup

### 1. Start Backend
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Start Frontend (Optional - for laptop mode)
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased\frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x
- Local:        http://localhost:3000
- Ready in Xs
```

### 3. Start ngrok (for mobile access)
```powershell
ngrok http 8000
```

**Expected Output:**
```
Forwarding   https://XXXXX.ngrok-free.app -> http://localhost:8000
```

**⚠️ IMPORTANT:** Update remote-controller/.env with your ngrok URL!

---

## 📱 Test 1: Mobile PTT Latency (NEW - Should Be Faster)

### Setup
1. Phone browser → `https://YOUR-NGROK-URL.ngrok-free.app/remote-controller/`
2. Wait for green "Connected" status
3. Select "Dr. A. Obulesu" persona

### Test Steps
**Trial 1: Short utterance**
1. Hold talk button
2. Say: "Hello, what is your name?"
3. Release button immediately after speaking
4. **⏱️ Start mental timer from button release**
5. **⏱️ Stop timer when you see "Thinking..." appear**

**Expected:** <100ms from release to "Thinking..." (feels instant)

**Trial 2: Longer utterance**
1. Hold talk button
2. Say: "Tell me about the placement opportunities at this college"
3. Release button
4. **⏱️ Time from release to "Thinking..."**

**Expected:** <100ms (same as short utterance)

### Pass Criteria
- ✅ "Thinking..." appears almost instantly after button release
- ✅ Transcript shows user text within 2-3 seconds
- ✅ Avatar response appears on mobile screen
- ✅ No error about "could not hear clearly" (unless you were actually silent)

### Fail Indicators
- ❌ Noticeable delay (>200ms) from release to "Thinking..."
- ❌ Frequent "could not hear clearly" errors
- ❌ Audio not recording at all
- ❌ App stuck on "Recording..." after release

---

## 💻 Test 2: Connection Status Badge (ENHANCED)

### Scenario A: Mobile Connects First (Should Already Work)

**Steps:**
1. Laptop browser → `http://localhost:3000`
2. Wait for avatar to appear
3. Look at bottom-right corner - badge should NOT be visible yet
4. Phone browser → remote controller (if not already open)
5. Wait for mobile to show "Connected"
6. **Look at laptop bottom-right corner**

**Expected:**
```
┌─────────────────────────────┐
│ 🟢 Remote Connected         │
└─────────────────────────────┘
```

**Pass Criteria:**
- ✅ Badge appears within 1 second of mobile connecting
- ✅ Badge shows green dot + "Remote Connected" text
- ✅ Badge positioned in bottom-right, above controls
- ✅ No page refresh required

---

### Scenario B: Laptop Connects After Mobile (NEW - This is the fix!)

**Steps:**
1. Close laptop browser tab (keep mobile connected)
2. Mobile should still show "Connected" status
3. **Wait 5 seconds** (to ensure mobile is stable)
4. Laptop browser → `http://localhost:3000` (fresh tab)
5. **Immediately look at bottom-right as page loads**

**Expected:**
- Badge appears **during or immediately after** avatar loads
- No delay waiting for next heartbeat or mobile activity

**Pass Criteria:**
- ✅ Badge visible within 2 seconds of page load
- ✅ Badge shows correctly even though laptop connected second
- ✅ Mobile remains connected during laptop reconnect

**This was the edge case that was fixed!**

---

### Scenario C: Mobile Disconnects

**Steps:**
1. Both laptop and mobile connected, badge showing
2. On mobile: Close browser tab OR turn off WiFi
3. **Watch laptop badge**

**Expected:**
- Badge disappears within 2-5 seconds

**Pass Criteria:**
- ✅ Badge disappears automatically
- ✅ No error messages on laptop
- ✅ Avatar still works on laptop (can use keyboard "A" to talk)

---

### Scenario D: Mobile Reconnects

**Steps:**
1. Mobile disconnected, badge not showing
2. On mobile: Reopen remote controller
3. Wait for "Connected" status on mobile
4. **Watch laptop badge**

**Expected:**
- Badge reappears within 1-2 seconds

**Pass Criteria:**
- ✅ Badge reappears automatically
- ✅ Mobile can immediately talk to avatar after reconnect

---

## 🔄 Test 3: Heartbeat & Resilience

### Test 3A: Network Interruption

**Steps:**
1. Connect mobile remote, confirm badge on laptop
2. On mobile: Turn OFF WiFi for 10 seconds
3. Turn WiFi back ON
4. **Watch mobile status indicator (top-right)**

**Expected:**
- Status changes: Connected → Connecting… → Connected
- Reconnection happens within 2-8 seconds
- Badge on laptop disappears then reappears

**Pass Criteria:**
- ✅ Mobile reconnects automatically
- ✅ Badge updates correctly on laptop
- ✅ No manual refresh needed

---

### Test 3B: Background Tab

**Steps:**
1. Connect mobile remote
2. Switch to home screen or another app for 60 seconds
3. Return to browser
4. Try talk button immediately

**Expected:**
- Connection still active (heartbeat kept it alive)
- Talk button works immediately

**Pass Criteria:**
- ✅ Mobile still shows "Connected"
- ✅ Can talk without waiting for reconnect
- ✅ Badge still showing on laptop

---

## 🎭 Test 4: Existing Functionality (Regression Test)

### Test 4A: Laptop Push-to-Talk Still Works

**Steps:**
1. Focus laptop browser (click on page)
2. Hold "A" key on keyboard
3. Speak: "What programs does the college offer?"
4. Release "A" key

**Expected:**
- Avatar responds to your speech
- Laptop works independently of mobile

**Pass Criteria:**
- ✅ Keyboard PTT unchanged
- ✅ Avatar animates and speaks
- ✅ Lip sync matches audio

---

### Test 4B: Mobile & Laptop Can Alternate

**Steps:**
1. Mobile: Talk → "What is your name?"
2. Wait for avatar response
3. Laptop: Hold "A", talk → "Thank you"
4. Wait for response
5. Mobile: Talk → "Tell me about placements"

**Expected:**
- Both modes work in same session
- Conversation history maintained
- Responses coherent

**Pass Criteria:**
- ✅ Both input sources work
- ✅ Avatar remembers context
- ✅ No conflicts or errors

---

### Test 4C: Persona Switching

**Steps:**
1. Mobile: Currently on "Dr. A. Obulesu"
2. Tap "Dr. Srujana" chip
3. Wait 1 second
4. Talk to avatar

**Expected:**
- Persona switches
- New conversation (history cleared)
- Response in new persona's voice/style

**Pass Criteria:**
- ✅ Persona switch works on mobile
- ✅ Conversation resets
- ✅ Badge stays visible through switch

---

### Test 4D: Language Selection

**Steps:**
1. Mobile: Select "EN" language pill
2. Talk in English
3. Switch to "हि" (Hindi)
4. Talk in Hindi (if you can)

**Expected:**
- Language selection works
- Backend processes selected language

**Pass Criteria:**
- ✅ Language pills highlight correctly
- ✅ Language preference sent to backend
- ✅ STT respects language selection

---

## 🐛 Test 5: Error Handling (Should Be Graceful)

### Test 5A: No Audio Input

**Steps:**
1. Hold talk button
2. Stay completely silent for 2 seconds
3. Release button

**Expected:**
- Either: Transcript shows empty or very short text
- Or: "Could not hear clearly" message (acceptable)
- Or: Backend rejects with "empty" status (acceptable)

**Pass Criteria:**
- ✅ No crash or hang
- ✅ Error message shown if applicable
- ✅ Can try again immediately

---

### Test 5B: Very Short Speech

**Steps:**
1. Hold talk button
2. Say "Hi" (very quick, <0.5s)
3. Release immediately

**Expected:**
- May work (if audio >= 0.55s with button hold time)
- May show warning (if < 0.55s)
- Console may log: `[Audio] Quality below threshold` (this is informational)

**Pass Criteria:**
- ✅ Doesn't crash
- ✅ Warning in console is OK (informational only)
- ✅ Backend may process or reject gracefully

---

### Test 5C: Backend Restart During Session

**Steps:**
1. Mobile connected, badge showing on laptop
2. In backend terminal: Press CTRL+C to stop uvicorn
3. Restart: `uvicorn app.main:app --reload`
4. **Watch mobile and laptop**

**Expected:**
- Mobile shows "Disconnected" → "Connecting..." → "Connected"
- Laptop badge disappears → reappears
- Both reconnect automatically

**Pass Criteria:**
- ✅ Auto-reconnect within 2-8 seconds
- ✅ No manual refresh needed
- ✅ System recovers gracefully

---

## 📊 Test Results Summary

| Test | Component | Expected Result | Status | Notes |
|------|-----------|----------------|--------|-------|
| 1 | Mobile PTT Latency | <100ms release-to-processing | ⬜ | Should feel faster |
| 2A | Badge: Mobile First | Appears within 1s | ⬜ | Already worked |
| 2B | Badge: Laptop After | Appears on load | ⬜ | **NEW: Edge case fix** |
| 2C | Badge: Disconnect | Disappears within 5s | ⬜ | Auto-update |
| 2D | Badge: Reconnect | Reappears within 2s | ⬜ | Auto-update |
| 3A | Network Recovery | Auto-reconnect in 2-8s | ⬜ | Resilience |
| 3B | Background Tab | Connection survives | ⬜ | Heartbeat |
| 4A | Laptop PTT | Still works | ⬜ | No regression |
| 4B | Alternating Input | Both work | ⬜ | No regression |
| 4C | Persona Switch | Works on mobile | ⬜ | No regression |
| 4D | Language Select | Works correctly | ⬜ | No regression |
| 5A | Silent Audio | Graceful error | ⬜ | Error handling |
| 5B | Short Speech | Graceful handling | ⬜ | Error handling |
| 5C | Backend Restart | Auto-recovery | ⬜ | Resilience |

**Status Legend:**
- ⬜ Not tested
- ✅ Pass
- ❌ Fail
- ⚠️ Pass with notes

---

## 🚨 If Tests Fail

### Mobile PTT Latency Not Improved
**Check:**
1. Browser console for errors
2. Ensure you're testing the new version (hard refresh: Ctrl+Shift+R)
3. Network latency may mask the improvement on slow connections

**Rollback:**
```powershell
git checkout HEAD -- remote-controller/main.js
```

---

### Badge Not Showing (Scenario B)
**Check:**
1. Backend logs: Should see "Remote connected" message
2. Browser console: Check for WebSocket errors
3. Verify relay.py changes applied correctly

**Rollback:**
```powershell
git checkout HEAD -- backend/app/core/avatar_relay.py
# Restart backend
```

---

### Connection Issues
**Check:**
1. `.env` files have correct ngrok URLs
2. Ngrok tunnel is active
3. Backend is running on port 8000
4. CORS is configured to allow ngrok domain

**Debug:**
```powershell
# Check backend health
curl http://localhost:8000/health

# Check WebSocket
# Open browser DevTools → Network → WS tab
# Should see /ws and /ws/remote connections
```

---

## ✅ Success Criteria (Overall)

**All tests must pass for deployment:**

### Critical (Must Pass)
- ✅ Mobile PTT works and feels faster
- ✅ Badge appears in scenario A (mobile first)
- ✅ Badge appears in scenario B (laptop after mobile) ← **KEY TEST**
- ✅ Badge disappears on disconnect
- ✅ Laptop keyboard PTT still works
- ✅ Avatar animation/lipsync unchanged

### Important (Should Pass)
- ✅ Auto-reconnect after network loss
- ✅ Heartbeat keeps connection alive
- ✅ Persona switching works
- ✅ Both input sources can alternate

### Nice to Have (Can have minor issues)
- ⚠️ Short/silent audio handling (informational warnings OK)
- ⚠️ Console logs (informational warnings OK)

---

## 📝 Test Log Template

```
Date: _____________
Tester: _____________
Backend Version: _____________
Mobile Browser: _____________
Laptop Browser: _____________

Test 1 (PTT Latency): _____ (Pass/Fail)
Test 2A (Badge Mobile First): _____ (Pass/Fail)
Test 2B (Badge Laptop After): _____ (Pass/Fail) ← NEW
Test 2C (Badge Disconnect): _____ (Pass/Fail)
Test 2D (Badge Reconnect): _____ (Pass/Fail)
Test 3A (Network Recovery): _____ (Pass/Fail)
Test 3B (Background Tab): _____ (Pass/Fail)
Test 4A-D (Regression): _____ (Pass/Fail)
Test 5A-C (Errors): _____ (Pass/Fail)

Overall Status: _____ (Pass/Fail)
Notes:
_________________________________
_________________________________
_________________________________

Approved for Production: _____ (Yes/No)
Sign-off: _____________
```

---

**Ready to test? Start with Pre-Test Setup and work through each test in order!**
