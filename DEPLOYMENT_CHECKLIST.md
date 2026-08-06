# Deployment Checklist - Mobile Remote Optimization

**Version:** 1.0  
**Date:** August 6, 2026  
**Changes:** Mobile PTT latency optimization + Connection status edge case fix

---

## ✅ Pre-Deployment Verification

### 1. Code Review
- [x] Only 2 files modified (remote-controller/main.js, backend/app/core/avatar_relay.py)
- [x] ~27 lines total changed/added
- [x] No breaking changes identified
- [x] No new dependencies added
- [x] All changes are backward compatible

### 2. Local Testing
- [ ] Mobile PTT responds faster (50-150ms improvement)
- [ ] Connection badge shows when mobile connects
- [ ] Badge shows even if laptop connects after mobile (NEW)
- [ ] Badge disappears when mobile disconnects
- [ ] Laptop keyboard PTT still works
- [ ] Avatar animation/lipsync unchanged
- [ ] Persona switching works
- [ ] Auto-reconnect after network loss works

### 3. Environment Files
- [ ] `backend/.env` configured with API keys
- [ ] `frontend/.env.local` configured with WebSocket URLs
- [ ] `remote-controller/.env` configured with backend URLs
- [ ] All `.env` files in `.gitignore`

---

## 🚀 Deployment Steps

### Step 1: Backup Current Version
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased

# Create backup branch
git branch backup-pre-optimization

# Verify backup
git log --oneline -5
```

### Step 2: Deploy Backend Changes
```powershell
# Stop current backend (if running)
# Press CTRL+C in uvicorn terminal

cd backend

# Verify virtual environment
.\.venv\Scripts\Activate.ps1

# Restart backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Application startup complete.
```

**Verify:**
```powershell
# Health check
curl http://localhost:8000/health

# Expected response: {"status":"ok",...}
```

### Step 3: Deploy Frontend (if needed)
```powershell
cd ..\frontend

# No rebuild needed - Next.js dev mode picks up changes automatically
# If running prod build:
npm run build
npm run start
```

### Step 4: Deploy Remote Controller
```powershell
cd ..\remote-controller

# No build step - vanilla JavaScript
# Files are served directly by Vite dev server or static hosting
```

---

## 🧪 Post-Deployment Testing

### Critical Tests (Must Pass)

#### Test 1: Mobile PTT Latency
**Action:**
1. Open mobile remote on phone
2. Hold button, speak, release
3. Measure subjective response time

**Expected:** Noticeably faster response

**Status:** [ ] Pass [ ] Fail

---

#### Test 2: Connection Status Badge
**Action:**
1. Open laptop first
2. Open mobile remote
3. Check bottom-right of laptop

**Expected:** Green badge appears immediately

**Status:** [ ] Pass [ ] Fail

---

#### Test 3: Edge Case - Laptop After Mobile
**Action:**
1. Open mobile remote first
2. Wait 5 seconds
3. Open laptop browser

**Expected:** Badge visible on laptop load

**Status:** [ ] Pass [ ] Fail

---

#### Test 4: Laptop PTT Still Works
**Action:**
1. Focus laptop browser
2. Hold "A" key, speak
3. Release

**Expected:** Avatar responds normally

**Status:** [ ] Pass [ ] Fail

---

### Important Tests (Should Pass)

#### Test 5: Auto-Reconnect
**Action:**
1. Connect mobile remote
2. Turn off WiFi for 10s
3. Turn WiFi back on

**Expected:** Reconnects automatically

**Status:** [ ] Pass [ ] Fail

---

#### Test 6: Persona Switching
**Action:**
1. On mobile, tap different persona
2. Speak to avatar

**Expected:** New persona responds

**Status:** [ ] Pass [ ] Fail

---

## 🐛 Rollback Procedure (If Needed)

### Quick Rollback
```powershell
cd c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased

# Restore from backup
git checkout backup-pre-optimization -- remote-controller/main.js
git checkout backup-pre-optimization -- backend/app/core/avatar_relay.py

# Restart backend
cd backend
# CTRL+C to stop, then:
uvicorn app.main:app --reload
```

### Verify Rollback
- [ ] Mobile PTT works (may be slower, that's OK)
- [ ] Connection badge works (edge case may fail, that's OK)
- [ ] All other functionality restored

---

## 📊 Monitoring (First 24 Hours)

### Metrics to Watch
- [ ] Mobile PTT success rate (should be same or better)
- [ ] Backend error logs (should not increase)
- [ ] WebSocket connection stability (should be same)
- [ ] User complaints about connection (should be same or fewer)

### Known Expected Changes
- ✅ Console may show: `[Audio] Quality below threshold` - this is informational
- ✅ Backend logs may show: "Remote connected" more frequently if testing
- ✅ Users may comment that mobile feels faster (positive feedback)

---

## 🔒 Security Checklist

### API Keys
- [ ] `.env` files not committed to git
- [ ] ngrok URLs updated in mobile remote env
- [ ] CORS configured correctly for ngrok domain

### WebSocket Security
- [ ] WSS (secure WebSocket) used in production
- [ ] No sensitive data logged in console
- [ ] Heartbeat doesn't leak information

---

## 📝 Documentation Updates

### Updated Files
- [x] OPTIMIZATION_SUMMARY.md (created)
- [x] TEST_SCRIPT.md (created)
- [x] DEPLOYMENT_CHECKLIST.md (this file)
- [ ] Update main README.md with "Recent optimizations" section (optional)

### Team Communication
- [ ] Notify team of deployment
- [ ] Share TEST_SCRIPT.md with QA team
- [ ] Document in release notes

---

## ✅ Deployment Sign-Off

### Technical Lead Approval
- **Tested By:** _______________
- **Date:** _______________
- **Test Results:** Pass [ ] / Fail [ ]
- **Ready for Production:** Yes [ ] / No [ ]

### Issues Found (if any)
```
__________________________________________________
__________________________________________________
__________________________________________________
```

### Deployment Completed
- **Deployed By:** _______________
- **Date:** _______________
- **Backend Restart Time:** _______________
- **Downtime:** _______________
- **Issues During Deployment:** None [ ] / See below [ ]

---

## 🎉 Success Criteria

Deployment is successful if:
- ✅ Mobile PTT works (faster response)
- ✅ Connection badge shows on laptop
- ✅ Badge shows even when laptop connects after mobile
- ✅ All existing functionality works
- ✅ No new errors in logs
- ✅ No user complaints

---

## 📞 Support Contacts

**If issues arise:**
1. Check backend logs: uvicorn output
2. Check browser console: F12 → Console
3. Test rollback procedure
4. Review OPTIMIZATION_SUMMARY.md

**Escalation:**
- Backend issues: Check backend/app/core/avatar_relay.py
- Mobile issues: Check remote-controller/main.js
- Network issues: Check ngrok tunnel, CORS settings

---

**Checklist Complete:** [ ] Yes [ ] No  
**Deployment Status:** [ ] Success [ ] Rollback [ ] In Progress  
**Final Sign-Off:** _______________ Date: _______________
