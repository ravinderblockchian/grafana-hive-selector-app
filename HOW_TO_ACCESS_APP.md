# How to Access the App Plugin in Grafana

## ⚠️ Important: App Plugin vs Plugin Details Page

When you click on "Site Manager Dashboard" in the **Plugins list**, you see the **plugin details/info page** (what you're seeing in the image). This is NOT the app itself - it's just the plugin information page.

To actually **use the app plugin**, you need to navigate to the app's URL directly.

---

## ✅ Correct Way to Access the App

### Method 1: Direct URL (Recommended)

Type this URL directly in your browser:

```
http://localhost:3001/a/mindking-site-manager-dashboard
```

**Note**: Replace `localhost:3001` with your Grafana URL if different.

### Method 2: From Apps Menu

1. Look for **"Apps"** in the left sidebar menu
2. Click on **"Apps"**
3. Find **"Site Manager Dashboard"** in the apps list
4. Click on it

### Method 3: From URL Bar

1. Click on the URL bar in Grafana
2. Type: `/a/mindking-site-manager-dashboard`
3. Press Enter

---

## 🔧 Troubleshooting

### Issue: "Plugin must be app" Error

If you see this error, it means:

1. **The plugin might not be loaded correctly**
   - Check Docker logs: `docker compose logs grafana | grep -i plugin`
   - Verify the plugin is in the `dist/` folder
   - Restart Grafana: `docker compose restart`

2. **The URL might be incorrect**
   - Make sure you're using: `/a/mindking-site-manager-dashboard`
   - NOT: `/plugins/mindking-site-manager-dashboard` (this is for plugin details)

3. **The plugin might not be enabled**
   - Go to: Home → Administration → Plugins and data → Plugins
   - Find "Site Manager Dashboard"
   - Make sure it shows as "Installed" and "Enabled"

### Issue: Blank Page

If you see a blank page:

1. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Go to "Console" tab
   - Look for any JavaScript errors

2. **Check Network Tab**
   - In Developer Tools, go to "Network" tab
   - Reload the page
   - Check if `module.js` is loading (should return 200 status)

3. **Verify Plugin Build**
   - Make sure you ran: `npm run build`
   - Check that `dist/module.js` exists and has content

4. **Check Grafana Logs**
   ```bash
   docker compose logs grafana | tail -50
   ```
   Look for plugin-related errors

---

## 📋 Step-by-Step Testing

### Step 1: Build the Plugin

```bash
cd /home/rahul/Downloads/ravi/mindking-custom-dropdown
npm run build
```

**Expected**: Build should complete successfully with "webpack compiled successfully"

### Step 2: Start/Restart Grafana

```bash
docker compose restart
```

Wait 30-60 seconds for Grafana to start.

### Step 3: Verify Plugin is Loaded

1. Go to: `http://localhost:3001`
2. Navigate to: **Home → Administration → Plugins and data → Plugins**
3. Find **"Site Manager Dashboard"**
4. It should show:
   - ✅ Type: **App**
   - ✅ Status: **Installed**
   - ✅ Version: **1.0.0**

### Step 4: Access the App

**DO NOT click on the plugin name** (that shows the details page).

Instead, **type this URL directly**:

```
http://localhost:3001/a/mindking-site-manager-dashboard
```

### Step 5: Verify App is Working

You should see:
- ✅ **Landing page** with view selection cards
- ✅ **No Grafana header/sidebar** (they should be hidden)
- ✅ **Full-screen app** experience

---

## 🎯 Quick Test URLs

Try these URLs directly:

### Landing Page
```
http://localhost:3001/a/mindking-site-manager-dashboard
```

### Dashboard View
```
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard
```

### With Site Selection
```
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA
```

### With Site + View Selection
```
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&selectedView=generator
```

### Configuration Page
```
http://localhost:3001/a/mindking-site-manager-dashboard/config
```

---

## 🔍 Debugging Checklist

If the app is not working:

- [ ] Plugin is built: `npm run build` completed successfully
- [ ] Plugin files exist: `dist/module.js` and `dist/plugin.json` exist
- [ ] Grafana is running: `docker compose ps` shows grafana as "Up"
- [ ] Plugin is enabled: Shows as "Installed" in plugins list
- [ ] Using correct URL: `/a/mindking-site-manager-dashboard` (not `/plugins/...`)
- [ ] Browser console: No JavaScript errors
- [ ] Network tab: `module.js` loads successfully (200 status)
- [ ] Grafana logs: No plugin-related errors

---

## 📝 Common Mistakes

❌ **Wrong**: Clicking on plugin name in plugins list → Shows details page
✅ **Correct**: Typing `/a/mindking-site-manager-dashboard` in URL → Shows app

❌ **Wrong**: Using `/plugins/mindking-site-manager-dashboard` → Wrong URL format
✅ **Correct**: Using `/a/mindking-site-manager-dashboard` → Correct app URL

❌ **Wrong**: Expecting app to load from plugin details page
✅ **Correct**: App loads from its own route `/a/<plugin-id>`

---

## 🆘 Still Not Working?

1. **Check Docker logs**:
   ```bash
   docker compose logs grafana | grep -i "mindking\|plugin\|error" | tail -30
   ```

2. **Check browser console** (F12 → Console tab) for errors

3. **Verify plugin.json** in `dist/plugin.json`:
   - Should have `"type": "app"`
   - Should have `"preload": true`
   - Should have correct `"id": "mindking-site-manager-dashboard"`

4. **Try clearing browser cache** and reload

5. **Restart Grafana completely**:
   ```bash
   docker compose down
   docker compose up -d
   ```

---

**Remember**: The plugin details page (what you see when clicking on the plugin name) is just for viewing plugin information. To actually **use the app**, navigate to `/a/mindking-site-manager-dashboard` directly!

