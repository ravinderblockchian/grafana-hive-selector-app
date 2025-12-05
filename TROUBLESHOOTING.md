# Troubleshooting Guide - "Application Not Enabled" Error

## 🔍 Understanding the Error

**"Application not enabled"** means Grafana can't load or recognize your app plugin. This can happen for several reasons.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Plugin Files

Check if all files are in place:

```bash
# Check local files
ls -la dist/module.js dist/plugin.json

# Check files in Docker container
docker compose exec grafana ls -la /var/lib/grafana/plugins/mindking-site-manager-dashboard/
```

**Expected**: Both `module.js` and `plugin.json` should exist.

### Step 2: Rebuild Plugin

```bash
npm run build
```

**Expected**: Should complete successfully with "webpack compiled successfully"

### Step 3: Restart Grafana Completely

```bash
docker compose down
docker compose up -d
```

Wait 30-60 seconds for Grafana to start.

### Step 4: Clear Browser Cache

**Important**: Clear your browser cache completely:

1. Press `Ctrl + Shift + Delete` (Windows/Linux) or `Cmd + Shift + Delete` (Mac)
2. Select:
   - ✅ Cached images and files
   - ✅ Cookies and other site data (optional but recommended)
3. Time range: "All time"
4. Click "Clear data"

**Or use Incognito/Private Window:**
- Opens with no cache
- Good for testing

### Step 5: Check Plugin Status

1. Go to: `http://localhost:3001`
2. Navigate to: **Home → Administration → Plugins and data → Plugins**
3. Find **"Site Manager Dashboard"**
4. Check:
   - ✅ Type: **App**
   - ✅ Status: Should show as installed/enabled
   - ✅ No red error messages

### Step 6: Check Grafana Logs

```bash
docker compose logs grafana | grep -i "mindking\|plugin.*error\|failed" | tail -30
```

Look for any errors related to the plugin.

### Step 7: Access the App

**DO NOT click on the plugin name** (that shows details page).

**Type this URL directly:**
```
http://localhost:3001/a/mindking-site-manager-dashboard
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Application not enabled" Error

**Possible Causes:**
- Plugin not properly built
- Plugin files not in container
- Browser cache showing old version
- Plugin not recognized by Grafana

**Fix:**
1. Rebuild: `npm run build`
2. Restart: `docker compose restart`
3. Clear browser cache
4. Try incognito window

### Issue 2: Blank Page / No Options Visible

**Possible Causes:**
- JavaScript error preventing render
- Plugin not loading
- Browser cache issue

**Fix:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Clear cache and reload
4. Check if `module.js` is loading (Network tab)

### Issue 3: Old Errors Still Showing

**Possible Causes:**
- Browser cache
- Grafana HTML cache
- Docker image cache

**Fix:**
1. Clear browser cache completely
2. Rebuild Docker image: `docker compose build --no-cache`
3. Restart: `docker compose down && docker compose up -d`

### Issue 4: Header/Sidebar Still Visible

**Possible Causes:**
- UI hiding code not running
- CSS not applied
- Grafana loading elements after code runs

**Fix:**
1. Wait 2-3 seconds (Grafana loads elements slowly)
2. Refresh page (F5)
3. Check browser console for errors
4. Verify `module.js` is loading

---

## 🔧 Advanced Troubleshooting

### Check Plugin Loading

1. Open browser console (F12)
2. Go to Network tab
3. Reload page
4. Look for `module.js`:
   - Should return **200** status
   - Should have content (not empty)
   - Should be from: `/public/plugins/mindking-site-manager-dashboard/module.js`

### Check Plugin Registration

In browser console, run:
```javascript
// Check if plugin is registered
window.grafanaBootData?.plugins?.mindking-site-manager-dashboard
```

Should return plugin info, not `undefined`.

### Verify Plugin.json

Check `dist/plugin.json`:
```json
{
  "type": "app",  // Must be "app"
  "id": "mindking-site-manager-dashboard",  // Must match
  "preload": true  // Should be true
}
```

### Check Docker Volume Mount

```bash
# Check if volume is mounted correctly
docker compose exec grafana ls -la /var/lib/grafana/plugins/mindking-site-manager-dashboard/

# Should show:
# - module.js
# - plugin.json
# - img/ folder
```

---

## 📋 Complete Reset Procedure

If nothing works, do a complete reset:

```bash
# 1. Stop everything
docker compose down

# 2. Remove old build
rm -rf dist/*

# 3. Rebuild plugin
npm run build

# 4. Verify files
ls -la dist/module.js dist/plugin.json

# 5. Rebuild Docker image (removes cached HTML)
docker compose build --no-cache

# 6. Start fresh
docker compose up -d

# 7. Wait for Grafana to start
sleep 30

# 8. Check logs
docker compose logs grafana | tail -20
```

Then:
1. Clear browser cache completely
2. Use incognito window
3. Go to: `http://localhost:3001/a/mindking-site-manager-dashboard`

---

## 🎯 Quick Checklist

Before reporting issues, verify:

- [ ] Plugin built successfully: `npm run build` completed
- [ ] Files exist: `dist/module.js` and `dist/plugin.json` present
- [ ] Docker running: `docker compose ps` shows grafana as "Up"
- [ ] Plugin enabled: Shows in plugins list as "App" type
- [ ] Browser cache cleared: Used incognito or cleared cache
- [ ] Correct URL: Using `/a/mindking-site-manager-dashboard` (not `/plugins/...`)
- [ ] No console errors: Browser console (F12) shows no JavaScript errors
- [ ] Module loading: Network tab shows `module.js` loading with 200 status

---

## 🆘 Still Not Working?

If after all steps it still doesn't work:

1. **Check Grafana version**: Should be >= 10.4.0
   ```bash
   docker compose exec grafana grafana-server -v
   ```

2. **Check plugin.json syntax**: Should be valid JSON
   ```bash
   cat dist/plugin.json | python3 -m json.tool
   ```

3. **Check module.js**: Should be valid JavaScript (not empty)
   ```bash
   head -20 dist/module.js
   ```

4. **Full Docker reset**:
   ```bash
   docker compose down -v  # Removes volumes too
   docker compose up -d
   ```

---

**Remember**: The most common issue is **browser cache**. Always try incognito window first!

