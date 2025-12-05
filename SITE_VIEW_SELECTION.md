# Site + View Selection Feature

## Overview

The app plugin now supports **dual selection**: users can select both a **site/group** from the tree dropdown and a **view** (appliance type) to load the appropriate set of metrics panels.

## Features

### 1. **Site/Group Selection**
- Select sites or groups from the nested tree dropdown
- Selection is synced with URL parameters
- Site selection updates dashboard variables

### 2. **View Selection (Appliance Types)**
- Select from predefined views:
  - **Generator** - Generator metrics and status
  - **Power System** - Power system metrics and analysis
  - **Cooling System** - Cooling system metrics and status
  - **Network** - Network metrics and connectivity
  - **Overview** - General site overview and summary
- View selection is synced with URL parameters

### 3. **Automatic Panel Loading**
- When both site and view are selected, the appropriate panel set is automatically loaded
- Panels are loaded with site-specific variables
- Panel sets are mapped to views (e.g., "generator" → "generator-metrics" panel set)

### 4. **URL Parameter Sync**
- All selections are reflected in URL parameters
- View can be restored from URL on page load
- External applications can control selections via iframe URL

## Usage

### User Flow

1. **Select Site/Group**: User picks a site or group from the tree dropdown
2. **Select View**: User picks a view (appliance type) from the view selector
3. **Automatic Loading**: The app automatically loads the appropriate panel set with site-specific metrics
4. **URL Update**: URL is updated to reflect both selections

### URL Parameters

#### Select Site and View
```
/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteA&selectedView=generator
```

#### Select View Only
```
/a/mindking-site-manager-dashboard?view=dashboard&selectedView=power-system
```

#### Select Site Only
```
/a/mindking-site-manager-dashboard?view=dashboard&selectedSite=SiteB
```

### External Control (Iframe)

Your parent application can control both selections:

```javascript
// Update iframe URL to select site and view
function selectSiteAndView(siteName, viewId) {
  const iframe = document.getElementById('grafana-iframe');
  const url = new URL(iframe.src);
  url.searchParams.set('selectedSite', siteName);
  url.searchParams.set('selectedView', viewId);
  iframe.src = url.toString();
}

// Example: Select SiteA and show generator metrics
selectSiteAndView('SiteA', 'generator');
```

## View to Panel Set Mapping

Views are mapped to panel sets in `libraryPanelControl.ts`:

| View ID | Panel Set | Description |
|---------|-----------|-------------|
| `generator` | `generator-metrics` | Generator-specific metrics |
| `power-system` | `power-system-metrics` | Power system metrics |
| `cooling` | `cooling-metrics` | Cooling system metrics |
| `network` | `network-metrics` | Network metrics |
| `overview` | `site-overview` | General site overview |

## Configuration

### Adding New Views

1. **Add View Option** in `ViewSelector.tsx`:
```typescript
{
  id: 'new-appliance',
  name: 'New Appliance',
  description: 'New appliance metrics',
  icon: 'icon-name',
  panelSet: 'new-appliance-metrics',
}
```

2. **Add Panel Set** in `libraryPanelControl.ts`:
```typescript
'new-appliance-metrics': {
  name: 'New Appliance Metrics',
  description: 'New appliance-specific metrics',
  libraryPanels: [
    { uid: 'panel-uid-1', title: 'Metric 1' },
    { uid: 'panel-uid-2', title: 'Metric 2' },
  ],
}
```

### Panel Set Library Panel UIDs

You need to:
1. Create library panels in Grafana UI
2. Note the UID of each library panel
3. Update `PREDEFINED_PANEL_SETS` in `libraryPanelControl.ts` with actual UIDs

## Implementation Details

### State Management

- `selectedSite`: Currently selected site/group node
- `selectedView`: Currently selected view ID
- `loadedPanelSet`: Currently loaded panel set name (to avoid reloading)

### URL Parameter Handling

- **Read**: On page load, URL parameters are parsed and selections are restored
- **Write**: When user makes selections, URL is updated automatically
- **Sync**: URL changes trigger panel loading

### Panel Loading Logic

1. Check if both site and view are selected
2. Map view ID to panel set name
3. Prepare variable overrides (site name, etc.)
4. Load panel set with variables
5. Update dashboard variables
6. Track loaded panel set to avoid duplicates

### Variable Overrides

When loading panels, the following variables are set:
- `site`: Selected site name/value
- Additional variables can be added in `loadPanelSetForSelection()`

## Example Scenarios

### Scenario 1: User Selects Site First, Then View
1. User selects "SiteA" from tree → URL updates: `?selectedSite=SiteA`
2. User selects "Generator" view → URL updates: `?selectedSite=SiteA&selectedView=generator`
3. App loads "generator-metrics" panel set with `site=SiteA` variable

### Scenario 2: User Selects View First, Then Site
1. User selects "Power System" view → URL updates: `?selectedView=power-system`
2. App loads "power-system-metrics" panel set (no site variable)
3. User selects "SiteB" → URL updates: `?selectedSite=SiteB&selectedView=power-system`
4. Dashboard variables updated with `site=SiteB`, panels refresh

### Scenario 3: External Control via URL
1. Parent app sets iframe URL: `?selectedSite=SiteC&selectedView=cooling`
2. App reads URL parameters on load
3. App selects SiteC in tree dropdown
4. App selects "Cooling" in view selector
5. App loads "cooling-metrics" panel set with `site=SiteC` variable

## UI Components

### ViewSelector Component
- Dropdown selector for views
- Shows view name, icon, and description
- Highlights selected view
- Located in the top control bar next to site selector

### Info Message
- Shows when site or view is not selected
- Guides user to make selections
- Disappears when both are selected

## Benefits

✅ **Intuitive UX**: Clear separation between site selection and view selection
✅ **Flexible**: Can select site without view, or view without site
✅ **URL Restorable**: All selections saved in URL for bookmarking/sharing
✅ **External Control**: Parent applications can control selections via iframe URL
✅ **Automatic Loading**: Panels load automatically when both selections are made
✅ **Site-Specific Metrics**: Panels receive site information via variables

---

**Status**: ✅ **Complete and Ready for Testing**

