# Implementation Summary & Testing Guide

## ✅ What Was Implemented

### 1. **App Plugin Conversion**
- ✅ Converted from Panel Plugin to **App Plugin**
- ✅ Full custom branding - Grafana UI hidden
- ✅ Complete control over layout and design
- ✅ Perfect for iframe embedding

### 2. **Landing Page with Preset Views**
- ✅ Beautiful landing page with view selection
- ✅ Multiple preset views (Site Overview, Detailed Metrics, Alarm Analysis, Custom Dashboard)
- ✅ Easy navigation between views

### 3. **Site Manager Dashboard**
- ✅ **Tree Dropdown Navigation** - Select sites/groups from hierarchical tree
- ✅ **Interactive Site Map** - Leaflet map with site markers
- ✅ **Alarm Summary Cards** - Critical, Major, Minor, Warning counts
- ✅ **Navigation Tree Sidebar** - Left sidebar with searchable tree

### 4. **Site + View Selection System**
- ✅ **Site/Group Selector** - Select from tree dropdown
- ✅ **View Selector** - Select appliance type (Generator, Power System, Cooling, Network, Overview)
- ✅ **Automatic Panel Loading** - Loads appropriate panel set when both are selected
- ✅ **Site-Specific Metrics** - Panels receive site information via variables

### 5. **Dynamic Library Panel Loading**
- ✅ Load library panels on demand
- ✅ Panel sets (grouped panels)
- ✅ Variable overrides for site-specific data
- ✅ URL-triggered panel loading

### 6. **URL Parameter Control**
- ✅ `selectedSite` - Select site in tree
- ✅ `selectedView` - Select view/appliance type
- ✅ `hidePanels` - Hide panels by title
- ✅ `showPanels` - Show panels by title
- ✅ `addPanelSet` - Load panel set
- ✅ `variableName` / `variableValue` - Update variables
- ✅ `refresh` - Refresh dashboard
- ✅ Full URL sync - All selections saved in URL

### 7. **External Control (Iframe)**
- ✅ Parent application can control dashboard via iframe URL
- ✅ Real-time updates when URL changes
- ✅ Perfect for embedding in external applications

---

## 🧪 How to Test in Grafana Portal

### Step 1: Build and Start Grafana

```bash
# Build the plugin
npm run build

# Start Grafana with Docker
docker compose up
```

Wait for Grafana to start (usually takes 30-60 seconds).

### Step 2: Access Grafana

Open your browser and go to:
```
http://localhost:3001
```

**Note**: Port 3001 is used (not 3000) to avoid conflicts.

### Step 3: Access the App Plugin

Navigate to the app plugin using one of these methods:

#### Method A: Direct URL
```
http://localhost:3001/a/mindking-site-manager-dashboard
```

#### Method B: From Grafana Menu
1. Click on **"Apps"** in the left sidebar (if visible)
2. Find **"Site Manager Dashboard"** in the apps list
3. Click on it

#### Method C: From Plugins Page
1. Go to **Home → Administration → Plugins and data → Plugins**
2. Find **"Site Manager Dashboard"** (App plugin)
3. Click on it to open

### Step 4: Test Landing Page

1. You should see the **Landing Page** with view selection cards
2. Try clicking on different views:
   - Site Overview
   - Detailed Metrics
   - Alarm Analysis
   - Custom Dashboard

### Step 5: Test Dashboard View

1. Click on **"Custom Dashboard"** or navigate to:
   ```
   http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard
   ```

2. You should see:
   - **Top Control Bar** with:
     - Site/Group dropdown selector
     - View selector (Generator, Power System, etc.)
     - Refresh button
   - **Left Sidebar** with navigation tree
   - **Main Content Area** with:
     - Info message (if site/view not selected)
     - Alarm summary cards
     - Site map

### Step 6: Test Site Selection

1. Click on the **"Site/Group"** dropdown
2. Navigate through the tree structure
3. Select a site or group
4. Notice:
   - URL updates with `selectedSite=...`
   - Site is highlighted in the navigation tree
   - Site marker is highlighted on the map (if applicable)

### Step 7: Test View Selection

1. Click on the **View selector** (next to Site/Group dropdown)
2. Select a view (e.g., "Generator")
3. Notice:
   - URL updates with `selectedView=generator`
   - If a site is also selected, panel set should load automatically

### Step 8: Test Site + View Selection

1. **Select a site** from the tree dropdown
2. **Select a view** (e.g., "Generator")
3. Notice:
   - URL updates: `?selectedSite=SiteA&selectedView=generator`
   - Info message disappears
   - Panel set should load (if library panels are configured)
   - Dashboard variables are updated with site information

### Step 9: Test URL Parameter Restoration

1. Copy the current URL (should have `selectedSite` and `selectedView`)
2. Open a new tab
3. Paste the URL
4. Notice:
   - Site is automatically selected in dropdown
   - View is automatically selected
   - Panel set loads automatically (if configured)

### Step 10: Test URL Parameter Control

Try these URLs directly:

```
# Select site only
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA

# Select view only
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedView=generator

# Select both
http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&selectedView=power-system
```

### Step 11: Test Configuration Page

1. Navigate to:
   ```
   http://localhost:3001/a/mindking-site-manager-dashboard/config
   ```

2. You should see:
   - Tree Data configuration (JSON textarea)
   - Devices Data configuration (JSON textarea)
   - Save button

3. Paste your tree data JSON and click "Save"
4. Go back to dashboard - tree should update

### Step 12: Test Custom Branding

Notice that:
- ✅ Grafana's header/navbar is hidden
- ✅ Grafana's sidebar is hidden
- ✅ Full-screen app experience
- ✅ Custom styling applied

### Step 13: Test Iframe Embedding (Optional)

Create an HTML file to test iframe embedding:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Iframe Embedding</title>
</head>
<body>
    <h1>Grafana Dashboard in Iframe</h1>
    <iframe 
        id="grafana-iframe"
        src="http://localhost:3001/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&selectedView=generator"
        width="100%" 
        height="800px"
        style="border: 1px solid #ccc;">
    </iframe>
    
    <script>
        // Test URL control
        function updateDashboard(site, view) {
            const iframe = document.getElementById('grafana-iframe');
            const url = new URL(iframe.src);
            url.searchParams.set('selectedSite', site);
            url.searchParams.set('selectedView', view);
            iframe.src = url.toString();
        }
        
        // Example: Update after 5 seconds
        setTimeout(() => {
            updateDashboard('SiteB', 'power-system');
        }, 5000);
    </script>
</body>
</html>
```

---

## 🔍 What to Check

### ✅ Visual Checks

- [ ] Landing page displays correctly
- [ ] Dashboard view loads without Grafana UI
- [ ] Site dropdown works and shows tree structure
- [ ] View selector works and shows all options
- [ ] Navigation tree sidebar displays correctly
- [ ] Alarm summary cards show (with mock data)
- [ ] Site map displays (with mock markers)
- [ ] URL updates when selections change

### ✅ Functional Checks

- [ ] Site selection updates URL
- [ ] View selection updates URL
- [ ] URL parameters restore selections on page reload
- [ ] Panel sets load when both site and view are selected (if library panels configured)
- [ ] Dashboard variables update with site information
- [ ] Configuration page saves tree data

### ✅ URL Parameter Checks

- [ ] `?selectedSite=SiteA` - Selects site
- [ ] `?selectedView=generator` - Selects view
- [ ] `?selectedSite=SiteA&selectedView=generator` - Selects both
- [ ] URL changes when user makes selections
- [ ] Page reload restores selections from URL

---

## 📝 Notes

### Library Panels Configuration

**Important**: The panel sets are configured with placeholder UIDs. To make panel loading work:

1. Create library panels in Grafana UI
2. Note the UID of each library panel
3. Edit `app-plugin/src/utils/libraryPanelControl.ts`
4. Update `PREDEFINED_PANEL_SETS` with actual UIDs

Example:
```typescript
'generator-metrics': {
  name: 'Generator Metrics',
  libraryPanels: [
    { uid: 'your-actual-panel-uid-1', title: 'Generator Status' },
    { uid: 'your-actual-panel-uid-2', title: 'Power Output' },
  ],
}
```

### Tree Data

The plugin uses default tree data for testing. To use your own data:

1. Go to Configuration page
2. Paste your tree JSON structure
3. Click "Save"
4. Tree data is stored in localStorage

Or pass via URL:
```
?treeData=<your-json-encoded>
```

---

## 🐛 Troubleshooting

### Plugin Not Loading

1. Check Docker logs: `docker compose logs grafana`
2. Verify plugin is in `dist/` folder
3. Check plugin ID matches in `plugin.json` and `docker-compose.yaml`
4. Restart Grafana: `docker compose restart`

### URL Parameters Not Working

1. Check browser console for errors
2. Verify URL format is correct
3. Check that selections are being read from URL

### Panels Not Loading

1. Verify library panels exist in Grafana
2. Check panel UIDs in `libraryPanelControl.ts`
3. Check browser console for errors
4. Verify dashboard is in edit mode (if required)

### UI Not Hidden

1. Check browser console for errors
2. Verify `module.ts` is applying styles
3. Check that app plugin is loaded (not panel plugin)

---

## 📚 Documentation Files

- `APP_PLUGIN_CONVERSION.md` - App plugin conversion details
- `SITE_VIEW_SELECTION.md` - Site + view selection feature
- `CLIENT_QUESTIONS.md` - Questions for client
- `panel-plugin/LIBRARY_PANELS.md` - Library panel guide (if still exists)

---

**Status**: ✅ **Ready for Testing**

