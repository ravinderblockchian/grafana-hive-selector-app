# Simple Guide - How It Works

## ✅ What I Fixed

### 1. **All Landing Page Options Now Work**
- Before: Only "Custom Dashboard" worked, others showed errors
- Now: All 4 options (Site Overview, Detailed Metrics, Alarm Analysis, Custom Dashboard) go to the dashboard
- Why: Panel sets aren't configured yet, so all options now go to the main dashboard where you can select site and view

### 2. **Grafana UI Hiding - Automatic**
- Before: Header and sidebar were still visible
- Now: Header and sidebar are automatically hidden
- How: The code runs automatically when the app loads - you don't need to do anything!

---

## 🎯 How to Use

### Step 1: Access the App
Type this URL in your browser:
```
http://localhost:3001/a/mindking-site-manager-dashboard
```

### Step 2: You'll See the Landing Page
- 4 clickable cards
- Click any card → All go to the dashboard now

### Step 3: Use the Dashboard
- **Select Site**: Use the "Site/Group" dropdown
- **Select View**: Use the view selector (Generator, Power System, etc.)
- **See Metrics**: When both are selected, panels will load (once library panels are configured)

---

## 🔍 About UI Hiding

**Question**: Do I need to hide the header/sidebar manually?

**Answer**: **NO!** It's automatic. The code hides them automatically when the app loads.

**How it works**:
1. When you open the app, the code runs automatically
2. It finds Grafana's header and sidebar
3. It hides them using CSS
4. It watches for changes and keeps them hidden

**If you still see them**:
- Wait 1-2 seconds (sometimes Grafana loads elements slowly)
- Refresh the page (F5)
- Check browser console (F12) for errors

---

## 📝 What Each Landing Page Option Does

All options now go to the **same dashboard**, but they're labeled differently for future use:

1. **Site Overview** → Goes to dashboard
2. **Detailed Metrics** → Goes to dashboard  
3. **Alarm Analysis** → Goes to dashboard
4. **Custom Dashboard** → Goes to dashboard

**Why?** Because panel sets (library panels) aren't configured yet. Once you configure them, each option can load different panel sets.

---

## 🚀 Next Steps

1. **Test the app**: 
   - Go to: `http://localhost:3001/a/mindking-site-manager-dashboard`
   - Click any card
   - You should see the dashboard with site and view selectors

2. **Check UI hiding**:
   - Header and sidebar should be hidden automatically
   - If not, refresh the page

3. **Configure panel sets** (later):
   - Create library panels in Grafana
   - Update `app-plugin/src/utils/libraryPanelControl.ts` with panel UIDs
   - Then each landing page option can load different panels

---

## ❓ Common Questions

**Q: Why do I still see Grafana header/sidebar?**
A: Refresh the page (F5). If still visible, check browser console (F12) for errors.

**Q: All options go to the same place?**
A: Yes, for now. Once you configure library panels, they can load different panel sets.

**Q: How do I configure panel sets?**
A: 
1. Create library panels in Grafana UI
2. Edit `app-plugin/src/utils/libraryPanelControl.ts`
3. Add your panel UIDs
4. Rebuild: `npm run build`
5. Restart: `docker compose restart`

**Q: The UI hiding doesn't work?**
A: 
1. Make sure you rebuilt: `npm run build`
2. Restart Grafana: `docker compose restart`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh page (F5)

---

**Status**: ✅ **Fixed and Ready to Test!**

