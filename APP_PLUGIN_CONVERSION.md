# App Plugin Conversion - Complete

## ✅ Conversion Summary

Successfully converted the panel plugin to an **App Plugin** with full custom branding, iframe embedding support, and dynamic panel loading capabilities.

## 🎯 Key Features Implemented

### 1. **Custom Branding & Full UI Control**
- ✅ Grafana's default UI (header, sidebar, navigation) is hidden
- ✅ Full-screen app experience
- ✅ Custom styling and branding support
- ✅ Complete control over layout and design

### 2. **Landing Page with Preset Views**
- ✅ Beautiful landing page with view selection
- ✅ Multiple preset views:
  - Site Overview
  - Detailed Metrics
  - Alarm Analysis
  - Custom Dashboard
- ✅ Easy navigation between views

### 3. **All Existing Features Preserved**
- ✅ Tree dropdown navigation
- ✅ Interactive site map (Leaflet)
- ✅ Alarm summary cards
- ✅ Navigation tree sidebar
- ✅ URL parameter control
- ✅ Dashboard panel show/hide
- ✅ Library panel dynamic loading

### 4. **Dynamic Panel Loading**
- ✅ Load library panels on demand
- ✅ Panel sets (grouped panels)
- ✅ Variable overrides
- ✅ URL-triggered panel loading
- ✅ Button-triggered panel loading

### 5. **URL Parameter Control**
- ✅ `selectedSite` - Select site in tree
- ✅ `hidePanels` - Hide panels by title
- ✅ `showPanels` - Show panels by title
- ✅ `addPanelSet` - Load panel set
- ✅ `variableName` / `variableValue` - Update variables
- ✅ `refresh` - Refresh dashboard

## 📁 Project Structure

```
app-plugin/
├── src/
│   ├── module.ts              # App plugin entry point
│   ├── plugin.json            # App plugin configuration
│   ├── components/
│   │   ├── LandingPage.tsx    # Landing page with view selection
│   │   ├── AlarmSummaryCards.tsx
│   │   ├── NavigationTree.tsx
│   │   ├── PanelSetSelector.tsx
│   │   └── SiteMap.tsx
│   ├── pages/
│   │   ├── AppRootPage.tsx    # Root page with routing
│   │   ├── SiteManagerPage.tsx # Main dashboard page
│   │   ├── ViewPresetPage.tsx  # Panel set loading page
│   │   └── ConfigPage.tsx      # Configuration page
│   └── utils/
│       ├── urlParams.ts        # URL parameter parsing
│       ├── dashboardControl.ts # Panel show/hide control
│       └── libraryPanelControl.ts # Library panel loading
└── img/                        # Plugin assets
```

## 🚀 Usage

### Accessing the App Plugin

1. **Landing Page**: `/a/mindking-site-manager-dashboard`
2. **Dashboard View**: `/a/mindking-site-manager-dashboard?view=dashboard`
3. **Preset View**: `/a/mindking-site-manager-dashboard?view=preset&panelSet=site-overview`
4. **Configuration**: `/a/mindking-site-manager-dashboard/config`

### URL Parameter Examples

**Select Site:**
```
/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA
```

**Load Panel Set:**
```
/a/mindking-site-manager-dashboard?view=preset&panelSet=detailed-metrics&selectedSite=SiteA
```

**Hide/Show Panels:**
```
/a/mindking-site-manager-dashboard?view=dashboard&hidePanels=Chart1,Chart2&showPanels=Map
```

**Full Control:**
```
/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&addPanelSet=site-overview&variableName=site&variableValue=SiteA&refresh=true
```

### Iframe Embedding

Your parent application can control the dashboard via iframe URL:

```html
<iframe 
  src="http://grafana:3000/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&addPanelSet=site-overview"
  width="100%" 
  height="800px">
</iframe>
```

## 🔧 Configuration

### Setting Up Library Panels

1. Create library panels in Grafana UI
2. Note the UID of each library panel
3. Edit `app-plugin/src/utils/libraryPanelControl.ts`
4. Update `PREDEFINED_PANEL_SETS` with your panel UIDs

Example:
```typescript
export const PREDEFINED_PANEL_SETS: Record<string, PanelSet> = {
  'site-overview': {
    name: 'Site Overview',
    libraryPanels: [
      { uid: 'your-panel-uid-1', title: 'Site Status' },
      { uid: 'your-panel-uid-2', title: 'Alarms' },
    ],
  },
};
```

### Tree Data Configuration

Tree data can be configured via:
1. **Configuration Page**: `/a/mindking-site-manager-dashboard/config`
2. **URL Parameter**: `?treeData=<json>`
3. **LocalStorage**: Stored automatically when configured

## 🎨 Customization

### Branding

Edit `app-plugin/src/module.ts` to customize:
- UI hiding logic
- Custom CSS styles
- Theme colors

### Landing Page

Edit `app-plugin/src/components/LandingPage.tsx` to:
- Add/remove preset views
- Customize view descriptions
- Change icons and styling

### Pages

Each page can be customized:
- `SiteManagerPage.tsx` - Main dashboard layout
- `ViewPresetPage.tsx` - Panel loading page
- `ConfigPage.tsx` - Configuration UI

## 📦 Build & Deploy

### Build
```bash
npm run build
```

### Development
```bash
npm run dev
```

### Docker
```bash
docker compose up
```

Access at: `http://localhost:3001/a/mindking-site-manager-dashboard`

## 🔄 Migration from Panel Plugin

The panel plugin code has been preserved in `panel-plugin/` directory. The app plugin:
- Uses the same components and utilities
- Maintains all functionality
- Adds app plugin-specific features (landing page, routing, UI hiding)

## 📝 Next Steps

1. **Create Library Panels**: Set up your library panels in Grafana
2. **Configure Panel Sets**: Update `PREDEFINED_PANEL_SETS` with your panel UIDs
3. **Customize Branding**: Update styles and UI in `module.ts`
4. **Test URL Parameters**: Verify all URL parameter commands work
5. **Integrate with Parent App**: Test iframe embedding and URL control

## 🎉 Benefits of App Plugin

✅ **Full Branding Control**: Hide Grafana UI, apply custom branding
✅ **Better for Iframe**: Clean, controlled embedding experience
✅ **Preset Views**: Easy navigation between different dashboard views
✅ **Dynamic Panel Loading**: Add panels on demand based on user actions
✅ **URL Control**: Full programmatic control via URL parameters
✅ **Future-Proof**: Easy to add new views and features over time

---

**Status**: ✅ **Complete and Ready for Testing**

