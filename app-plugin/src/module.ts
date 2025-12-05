// @ts-nocheck
import React from 'react';
import { AppPlugin } from '@grafana/data';
import { AppRootPage } from './pages/AppRootPage';
import { SiteManagerPage } from './pages/SiteManagerPage';
import { ViewPresetPage } from './pages/ViewPresetPage';
import { ConfigPage } from './pages/ConfigPage';
import { OverviewPage } from './pages/OverviewPage';
import { DashboardPage } from './pages/DashboardPage';

// Hide Grafana's default UI elements
function hideGrafanaUI() {
  // Extended list of selectors to hide with more specific targeting
  const selectorsToHide = [
    '.navbar',
    '.sidemenu',
    '.page-header',
    '.page-toolbar',
    'nav[aria-label="Main"]',
    'nav[aria-label="Top menu"]',
    '.navbar-page-btn',
    '.sidemenu__logo',
    '.sidemenu__brand',
    '.sidemenu__top',
    '.sidemenu__bottom',
    'header[role="banner"]',
    'aside[aria-label="Main navigation"]',
    '.navbar-brand',
    '.navbar-brand-link',
    '.navbar-button',
    '.sidemenu__item',
    '.sidemenu__link',
    '.sidemenu__spacer',
    'nav.sidemenu',
    'header.navbar',
    '.page-header__inner',
    '.page-header__tabs',
    '.page-header__actions',
    // More specific header selectors
    'header',
    'header > *',
    '.navbar-brand',
    '.navbar-brand-link',
    '[class*="navbar"]',
    '[class*="page-header"]',
    '[class*="header"]',
    '[data-testid*="navbar"]',
    '[data-testid*="header"]',
    'header .navbar-brand',
    'header .navbar-brand-link',
    'header .navbar-button',
    'header .navbar-page-btn',
    'header nav',
    'header .page-header',
    // Sidebar specific selectors
    'aside',
    'aside[class*="sidemenu"]',
    'aside[class*="sidebar"]',
    '[class*="sidemenu"]',
    '[class*="sidebar"]',
    '.sidemenu',
    '.sidebar',
    'nav[class*="sidemenu"]',
    'nav[class*="sidebar"]',
  ];

  selectorsToHide.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = 'none';
      htmlEl.style.visibility = 'hidden';
      htmlEl.style.opacity = '0';
      htmlEl.style.width = '0';
      htmlEl.style.height = '0';
      htmlEl.style.position = 'absolute';
      htmlEl.style.left = '-9999px';
      htmlEl.style.pointerEvents = 'none';
    });
  });

  // Also hide by class name patterns
  document.querySelectorAll('[class*="navbar"], [class*="sidemenu"], [class*="page-header"], [class*="page-toolbar"], [class*="header"], [class*="sidebar"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.offsetParent !== null) { // Only hide if visible
      htmlEl.style.display = 'none';
      htmlEl.style.visibility = 'hidden';
      htmlEl.style.opacity = '0';
      htmlEl.style.width = '0';
      htmlEl.style.height = '0';
      htmlEl.style.position = 'absolute';
      htmlEl.style.left = '-9999px';
      htmlEl.style.pointerEvents = 'none';
    }
  });

  // Specifically target all header and sidebar elements - more aggressive
  const selectors = [
    'header',
    'aside',
    '[class*="sidemenu"]',
    '[class*="sidebar"]',
    '[class*="side-menu"]',
    'nav[class*="sidemenu"]',
    'nav[class*="sidebar"]',
    '[data-testid*="sidemenu"]',
    '[data-testid*="sidebar"]',
    '[data-testid*="navigation"]',
    '[data-testid*="mega-menu"]',
    '[class*="css-1plwt8c"]', // Specific sidebar class from user's HTML
    '[role="navigation"]',
    '[aria-label*="navigation"]',
    '[aria-label*="Navigation"]'
  ];
  
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Check if it's not part of the app plugin
      if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
        htmlEl.style.setProperty('display', 'none', 'important');
        htmlEl.style.setProperty('visibility', 'hidden', 'important');
        htmlEl.style.setProperty('opacity', '0', 'important');
        htmlEl.style.setProperty('width', '0', 'important');
        htmlEl.style.setProperty('min-width', '0', 'important');
        htmlEl.style.setProperty('max-width', '0', 'important');
        htmlEl.style.setProperty('height', '0', 'important');
        htmlEl.style.setProperty('min-height', '0', 'important');
        htmlEl.style.setProperty('max-height', '0', 'important');
        htmlEl.style.setProperty('position', 'absolute', 'important');
        htmlEl.style.setProperty('left', '-9999px', 'important');
        htmlEl.style.setProperty('pointer-events', 'none', 'important');
        htmlEl.style.setProperty('margin', '0', 'important');
        htmlEl.style.setProperty('padding', '0', 'important');
        htmlEl.style.setProperty('border', 'none', 'important');
        htmlEl.style.setProperty('overflow', 'hidden', 'important');
        // Also try removing from DOM if it's a sidebar
        if (selector.includes('sidebar') || selector.includes('sidemenu') || el.tagName === 'ASIDE') {
          try {
            htmlEl.remove();
          } catch (e) {
            // Ignore if removal fails
          }
        }
      }
    });
  });
  
  // Also check for any element with Grafana logo that might be the sidebar
  document.querySelectorAll('img[alt*="Grafana"], [class*="logo"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const parent = htmlEl.closest('aside, nav, [class*="sidemenu"], [class*="sidebar"], [data-testid*="navigation"], [data-testid*="mega-menu"]');
    if (parent && !parent.closest('[class*="app-plugin"]') && !parent.closest('[class*="mindking"]')) {
      const parentEl = parent as HTMLElement;
      parentEl.style.setProperty('display', 'none', 'important');
      parentEl.style.setProperty('width', '0', 'important');
      parentEl.style.setProperty('position', 'absolute', 'important');
      parentEl.style.setProperty('left', '-9999px', 'important');
      try {
        parentEl.remove();
      } catch (e) {
        // Ignore if removal fails
      }
    }
  });
  
  // Specifically target the sidebar element from user's HTML
  const sidebarElement = document.querySelector('[data-testid*="navigation"][data-testid*="mega-menu"], [class*="css-1plwt8c"]');
  if (sidebarElement) {
    const htmlEl = sidebarElement as HTMLElement;
    if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
      htmlEl.style.setProperty('display', 'none', 'important');
      htmlEl.style.setProperty('visibility', 'hidden', 'important');
      htmlEl.style.setProperty('opacity', '0', 'important');
      htmlEl.style.setProperty('width', '0', 'important');
      htmlEl.style.setProperty('min-width', '0', 'important');
      htmlEl.style.setProperty('max-width', '0', 'important');
      htmlEl.style.setProperty('height', '0', 'important');
      htmlEl.style.setProperty('min-height', '0', 'important');
      htmlEl.style.setProperty('max-height', '0', 'important');
      htmlEl.style.setProperty('position', 'absolute', 'important');
      htmlEl.style.setProperty('left', '-9999px', 'important');
      htmlEl.style.setProperty('pointer-events', 'none', 'important');
      htmlEl.style.setProperty('margin', '0', 'important');
      htmlEl.style.setProperty('padding', '0', 'important');
      htmlEl.style.setProperty('border', 'none', 'important');
      htmlEl.style.setProperty('overflow', 'hidden', 'important');
      try {
        htmlEl.remove();
      } catch (e) {
        // Ignore if removal fails
      }
    }
  }
  
  // Also check parent containers that might be creating the layout gap
  const parentContainer = sidebarElement?.parentElement;
  if (parentContainer && !parentContainer.closest('[class*="app-plugin"]') && !parentContainer.closest('[class*="mindking"]')) {
    const parentEl = parentContainer as HTMLElement;
    const computedStyle = window.getComputedStyle(parentEl);
    // If parent is using flexbox or grid, adjust it
    if (computedStyle.display === 'flex' || computedStyle.display === 'grid') {
      // Remove the sidebar from the layout
      parentEl.style.setProperty('display', 'flex', 'important');
      parentEl.style.setProperty('flex-direction', 'row', 'important');
    }
    // Ensure no left margin/padding
    parentEl.style.setProperty('margin-left', '0', 'important');
    parentEl.style.setProperty('padding-left', '0', 'important');
  }

  // Adjust main content area to fill the screen - more aggressive
  const mainContent = document.querySelector('.main-view');
  if (mainContent) {
    const htmlEl = mainContent as HTMLElement;
    htmlEl.style.setProperty('margin-left', '0', 'important');
    htmlEl.style.setProperty('margin-right', '0', 'important');
    htmlEl.style.setProperty('margin-top', '0', 'important');
    htmlEl.style.setProperty('padding-left', '0', 'important');
    htmlEl.style.setProperty('padding-right', '0', 'important');
    htmlEl.style.setProperty('padding-top', '0', 'important');
    htmlEl.style.setProperty('width', '100vw', 'important');
    htmlEl.style.setProperty('height', '100vh', 'important');
    htmlEl.style.setProperty('max-width', '100vw', 'important');
    htmlEl.style.setProperty('max-height', '100vh', 'important');
    htmlEl.style.setProperty('position', 'fixed', 'important');
    htmlEl.style.setProperty('top', '0', 'important');
    htmlEl.style.setProperty('left', '0', 'important');
    htmlEl.style.setProperty('right', '0', 'important');
    htmlEl.style.setProperty('bottom', '0', 'important');
    
    // Override any grid/flex layout
    const computedStyle = window.getComputedStyle(htmlEl);
    if (computedStyle.display === 'grid' || computedStyle.display === 'flex') {
      htmlEl.style.setProperty('display', 'block', 'important');
    }
  }
  
  // Find and override parent layout containers (CSS Grid/Flexbox)
  const layoutContainers = document.querySelectorAll('[class*="layout"], [class*="Layout"], [class*="page-wrapper"], [class*="page-container"]');
  layoutContainers.forEach((container) => {
    const htmlEl = container as HTMLElement;
    if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
      const computedStyle = window.getComputedStyle(htmlEl);
      // If it's a grid layout, remove sidebar column
      if (computedStyle.display === 'grid') {
        htmlEl.style.setProperty('grid-template-columns', '1fr', 'important');
        htmlEl.style.setProperty('grid-template-areas', '"main"', 'important');
      }
      // Remove any left margin/padding
      htmlEl.style.setProperty('margin-left', '0', 'important');
      htmlEl.style.setProperty('padding-left', '0', 'important');
    }
  });
  
  // Find any element that might be creating the sidebar gap
  // Check all direct children of body and #reactRoot
  const rootContainers = [document.body, document.getElementById('reactRoot')].filter(Boolean) as HTMLElement[];
  rootContainers.forEach((root) => {
    Array.from(root.children).forEach((child) => {
      const childEl = child as HTMLElement;
      if (!childEl.closest('[class*="app-plugin"]') && !childEl.closest('[class*="mindking"]')) {
        const computedStyle = window.getComputedStyle(childEl);
        // If it's positioned on the left and has width, it might be the sidebar container
        if (computedStyle.position !== 'absolute' && 
            (parseInt(computedStyle.marginLeft) > 0 || 
             parseInt(computedStyle.paddingLeft) > 0 ||
             childEl.offsetLeft > 0)) {
          // Check if it contains sidebar elements
          if (childEl.querySelector('aside, [class*="sidemenu"], [class*="sidebar"]')) {
            childEl.style.setProperty('display', 'none', 'important');
            childEl.style.setProperty('width', '0', 'important');
            childEl.style.setProperty('position', 'absolute', 'important');
            childEl.style.setProperty('left', '-9999px', 'important');
          }
        }
      }
    });
  });
  
    // Also check for any parent containers that might have left margin/padding
    let parent = mainContent?.parentElement;
    while (parent && parent !== document.body) {
      const parentEl = parent as HTMLElement;
      // Remove any left margin/padding/transform that might create gap
      parentEl.style.setProperty('margin-left', '0', 'important');
      parentEl.style.setProperty('padding-left', '0', 'important');
      parentEl.style.setProperty('left', '0', 'important');
      // Check computed styles too
      const computedStyle = window.getComputedStyle(parentEl);
      if (parseInt(computedStyle.marginLeft) > 0 || parseInt(computedStyle.paddingLeft) > 0) {
        parentEl.style.setProperty('margin-left', '0', 'important');
        parentEl.style.setProperty('padding-left', '0', 'important');
      }
      parent = parent.parentElement;
    }
    
    // Also check body and html for any left margin/padding
    document.body.style.setProperty('margin-left', '0', 'important');
    document.body.style.setProperty('padding-left', '0', 'important');
    document.documentElement.style.setProperty('margin-left', '0', 'important');
    document.documentElement.style.setProperty('padding-left', '0', 'important');

  // Also adjust page-container, page-body, page-content - more aggressive
  ['page-container', 'page-body', 'page-content'].forEach((className) => {
    const element = document.querySelector(`.${className}`);
    if (element) {
      const htmlEl = element as HTMLElement;
      htmlEl.style.setProperty('margin-left', '0', 'important');
      htmlEl.style.setProperty('margin-right', '0', 'important');
      htmlEl.style.setProperty('margin-top', '0', 'important');
      htmlEl.style.setProperty('padding-left', '0', 'important');
      htmlEl.style.setProperty('padding-right', '0', 'important');
      htmlEl.style.setProperty('padding-top', '0', 'important');
      htmlEl.style.setProperty('width', '100vw', 'important');
      htmlEl.style.setProperty('height', '100vh', 'important');
      htmlEl.style.setProperty('position', 'fixed', 'important');
      htmlEl.style.setProperty('top', '0', 'important');
      htmlEl.style.setProperty('left', '0', 'important');
    }
  });

  // Apply custom styles to body and html
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.margin = '0';
  document.documentElement.style.padding = '0';
}

// Function to restore Grafana UI (show header and sidebar)
function restoreGrafanaUI() {
  // Remove the custom branding style
  const styleElement = document.getElementById('mindking-hide-ui-style');
  if (styleElement) {
    styleElement.remove();
  }

  // Restore body and html styles
  document.body.style.overflow = '';
  document.body.style.margin = '';
  document.body.style.padding = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.margin = '';
  document.documentElement.style.padding = '';

  // Restore main content area styles
  const mainContent = document.querySelector('.main-view');
  if (mainContent) {
    const htmlEl = mainContent as HTMLElement;
    htmlEl.style.removeProperty('margin-left');
    htmlEl.style.removeProperty('margin-right');
    htmlEl.style.removeProperty('margin-top');
    htmlEl.style.removeProperty('padding-left');
    htmlEl.style.removeProperty('padding-right');
    htmlEl.style.removeProperty('padding-top');
    htmlEl.style.removeProperty('width');
    htmlEl.style.removeProperty('height');
    htmlEl.style.removeProperty('max-width');
    htmlEl.style.removeProperty('max-height');
    htmlEl.style.removeProperty('position');
    htmlEl.style.removeProperty('top');
    htmlEl.style.removeProperty('left');
    htmlEl.style.removeProperty('right');
    htmlEl.style.removeProperty('bottom');
    htmlEl.style.removeProperty('display');
  }

  // Restore layout containers
  const layoutContainers = document.querySelectorAll('[class*="layout"], [class*="Layout"], [class*="page-wrapper"], [class*="page-container"]');
  layoutContainers.forEach((container) => {
    const htmlEl = container as HTMLElement;
    if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
      htmlEl.style.removeProperty('grid-template-columns');
      htmlEl.style.removeProperty('grid-template-areas');
      htmlEl.style.removeProperty('margin-left');
      htmlEl.style.removeProperty('padding-left');
    }
  });

  // Restore page-container, page-body, page-content
  ['page-container', 'page-body', 'page-content'].forEach((className) => {
    const element = document.querySelector(`.${className}`);
    if (element) {
      const htmlEl = element as HTMLElement;
      htmlEl.style.removeProperty('margin-left');
      htmlEl.style.removeProperty('margin-right');
      htmlEl.style.removeProperty('margin-top');
      htmlEl.style.removeProperty('padding-left');
      htmlEl.style.removeProperty('padding-right');
      htmlEl.style.removeProperty('padding-top');
      htmlEl.style.removeProperty('width');
      htmlEl.style.removeProperty('height');
      htmlEl.style.removeProperty('position');
      htmlEl.style.removeProperty('top');
      htmlEl.style.removeProperty('left');
    }
  });

  // Restore parent container styles
  let parent = mainContent?.parentElement;
  while (parent && parent !== document.body) {
    const parentEl = parent as HTMLElement;
    parentEl.style.removeProperty('margin-left');
    parentEl.style.removeProperty('padding-left');
    parentEl.style.removeProperty('left');
    parent = parent.parentElement;
  }

  // Restore body and html margin/padding
  document.body.style.removeProperty('margin-left');
  document.body.style.removeProperty('padding-left');
  document.documentElement.style.removeProperty('margin-left');
  document.documentElement.style.removeProperty('padding-left');
}

// Apply custom branding styles
function applyCustomBranding() {
  // Check if style already exists
  if (document.getElementById('mindking-hide-ui-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'mindking-hide-ui-style';
  style.textContent = `
    /* Hide Grafana UI elements - Ultra aggressive selectors with high specificity */
    body header:not([class*="app-plugin"]):not([class*="mindking"]),
    body .navbar,
    body .sidemenu,
    body .sidebar,
    body aside:not([class*="app-plugin"]):not([class*="mindking"]),
    body .page-header,
    body .page-toolbar,
    body nav[aria-label="Main"],
    body nav[aria-label="Top menu"],
    body .navbar-page-btn,
    body .sidemenu__logo,
    body .sidemenu__brand,
    body .sidemenu__top,
    body .sidemenu__bottom,
    body header[role="banner"],
    body aside[aria-label="Main navigation"],
    body .navbar-brand,
    body .navbar-brand-link,
    body .navbar-button,
    body .sidemenu__item,
    body .sidemenu__link,
    body .sidemenu__spacer,
    body .sidemenu__bottom,
    body .sidemenu__top,
    body nav.sidemenu,
    body header.navbar,
    body .page-toolbar,
    body .page-header,
    body .page-header__inner,
    body .page-header__tabs,
    body .page-header__actions,
    body header > *,
    body header .navbar-brand,
    body header .navbar-brand-link,
    body header .navbar-button,
    body header .navbar-page-btn,
    body header nav,
    body header .page-header,
    body [class*="navbar"],
    body [class*="page-header"],
    body [class*="header"]:not([class*="app-plugin"]):not([class*="mindking"]),
    body [data-testid*="navbar"],
    body [data-testid*="header"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      position: absolute !important;
      left: -9999px !important;
      pointer-events: none !important;
      z-index: -1 !important;
    }

    /* Full screen app - override all Grafana containers */
    body .main-view,
    body .page-container,
    body .page-body,
    body .page-content {
      margin-left: 0 !important;
      margin-right: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      height: 100vh !important;
      width: 100vw !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      overflow: hidden !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
    }

    /* Remove any left margin/padding from parent containers */
    body > div,
    body #reactRoot,
    body #reactRoot > div,
    body [class*="main-view"],
    body [class*="page-container"],
    body [class*="page-body"],
    body [class*="page-wrapper"],
    body [class*="page-content"] {
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      left: 0 !important;
      right: 0 !important;
    }
    
    /* Ensure no gap from sidebar - target all possible container classes */
    body .main-view,
    body .page-container,
    body .page-body,
    body .page-content,
    body .page-wrapper,
    body [class*="main-view"],
    body [class*="page-container"],
    body [class*="page-body"],
    body [class*="page-wrapper"],
    body [class*="app-container"],
    body [class*="app-content"] {
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      left: 0 !important;
      right: 0 !important;
      transform: translateX(0) !important;
      width: 100vw !important;
      max-width: 100vw !important;
    }
    
    /* Target Grafana's specific layout classes */
    body [class*="sidemenu"] ~ *,
    body [class*="sidebar"] ~ * {
      margin-left: 0 !important;
      padding-left: 0 !important;
    }

    /* Don't override child divs - let app plugin control its own layout */
    body .main-view > div,
    body .page-container > div,
    body .page-body > div,
    body .page-content > div {
      /* Let app plugin control its own padding/margins */
    }
    
    /* Override Grafana's layout system - remove sidebar column from grid/flex */
    body [class*="layout"],
    body [class*="Layout"],
    body [class*="page-wrapper"],
    body [class*="page-container"],
    body #reactRoot > div,
    body #reactRoot > div > div {
      display: block !important;
      grid-template-columns: 1fr !important;
      grid-template-areas: "main" !important;
    }
    
    /* Force main content to start at 0 */
    body [class*="main-view"],
    body [class*="page-content"],
    body [class*="page-body"] {
      grid-column: 1 !important;
      grid-area: main !important;
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
    }
    
    /* Remove any sidebar column from grid */
    body [class*="sidemenu"],
    body [class*="sidebar"],
    body aside,
    body [data-testid*="navigation"],
    body [data-testid*="mega-menu"],
    body [class*="css-1plwt8c"] {
      grid-column: unset !important;
      grid-area: unset !important;
    }
    
    /* Target any element that might be creating left gap */
    body > div:first-child,
    body #reactRoot > div:first-child {
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
    }
    
    /* Ensure the page-content div (from user's HTML) starts at 0 */
    body [class*="css-1nlceg4-page-content"],
    body div[class*="page-content"] {
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
    }

    /* Ensure main view doesn't have left margin for sidebar */
    body .main-view {
      margin-left: 0 !important;
      padding-left: 0 !important;
    }

    /* Hide Grafana's main container padding and margins */
    body .main-view > div,
    body .page-container > div,
    body .page-body > div,
    body .page-content > div {
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Custom app container */
    body .app-plugin-container {
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
      background: var(--grafana-background-canvas, #0b0c0e) !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 1 !important;
    }
    
    /* Override Grafana's layout system - remove sidebar column from grid/flex */
    body [class*="layout"],
    body [class*="Layout"],
    body [class*="page-wrapper"],
    body [class*="page-container"] {
      display: block !important;
      grid-template-columns: 1fr !important;
      grid-template-areas: "main" !important;
    }
    
    /* Force main content to start at 0 */
    body [class*="main-view"],
    body [class*="page-content"],
    body [class*="page-body"] {
      grid-column: 1 !important;
      grid-area: main !important;
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
    }
    
    /* Remove any sidebar column from grid */
    body [class*="sidemenu"],
    body [class*="sidebar"],
    body aside {
      grid-column: unset !important;
      grid-area: unset !important;
    }

    /* Remove Grafana's default padding and ensure full screen */
    body {
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Ensure html element also doesn't have margins */
    html {
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Hide any Grafana navigation that might appear */
    body [class*="navbar"],
    body [class*="sidemenu"],
    body [class*="sidebar"],
    body [class*="page-header"],
    body [class*="page-toolbar"],
    body [class*="header"]:not([class*="app-plugin"]):not([class*="mindking"]),
    body [role="banner"],
    body [aria-label*="navigation"],
    body [aria-label*="Navigation"],
    body [aria-label*="Main navigation"],
    body header:not([class*="app-plugin"]):not([class*="mindking"]),
    body > header,
    body aside:not([class*="app-plugin"]):not([class*="mindking"]),
    body > aside,
    body [class*="sidemenu"],
    body [class*="sidebar"],
    body [class*="side-menu"],
    body nav[class*="sidemenu"],
    body nav[class*="sidebar"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      position: absolute !important;
      left: -9999px !important;
      pointer-events: none !important;
      z-index: -1 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
}

// Initialize UI hiding and branding - ONLY on dashboard pages, not on plugin config pages
if (typeof window !== 'undefined') {
  // Check if we're on a dashboard page (not on /plugins/ route or landing page)
  const isDashboardPage = () => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    
    // Only hide UI when view=dashboard is explicitly set
    // Landing page (no view param or view=landing) should show Grafana UI for navigation
    // Dashboard view (view=dashboard) should hide Grafana UI for full branding
    return pathname.includes('/a/mindking-site-manager-dashboard') && viewParam === 'dashboard';
  };

  // Function to check and apply UI hiding dynamically
  const checkAndApplyUIHiding = () => {
    if (isDashboardPage()) {
      // Hide UI for dashboard view
      applyCustomBranding();
      hideGrafanaUI();
    } else {
      // Show UI for landing page - restore Grafana UI
      restoreGrafanaUI();
    }
  };

  // Function to apply hiding
  const applyHiding = () => {
    if (isDashboardPage()) {
      hideGrafanaUI();
      applyCustomBranding(); // Re-apply in case style was removed
    } else {
      restoreGrafanaUI();
    }
  };

  // Apply immediately based on current state
  checkAndApplyUIHiding();

  // Apply when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHiding);
  } else {
    // DOM already ready, apply immediately
    setTimeout(applyHiding, 0);
  }

  // Apply after a short delay (Grafana might load elements dynamically) - reduced frequency
  setTimeout(applyHiding, 100);
  setTimeout(applyHiding, 500);

  // Only set up observers and listeners if we're on the app plugin route
  if (window.location.pathname.includes('/a/mindking-site-manager-dashboard')) {

    // Debounce function to prevent too frequent updates
    let debounceTimer: NodeJS.Timeout | null = null;
    const debouncedApplyHiding = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        if (isDashboardPage()) {
          applyHiding();
        }
      }, 100); // Debounce to 100ms
    };

    // Watch for dynamic content changes with debouncing
    const observer = new MutationObserver((mutations) => {
      // Check current page state first
      const isDashboard = isDashboardPage();
      
      if (isDashboard) {
        // Always apply hiding if on dashboard page
        debouncedApplyHiding();
      } else {
        // Restore UI if not on dashboard
        restoreGrafanaUI();
      }
      
      // Check for relevant changes
      let hasRelevantChanges = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            // Quick check for relevant elements
            if (element.tagName === 'HEADER' || 
                element.tagName === 'ASIDE' ||
                element.classList?.contains('navbar') ||
                element.classList?.contains('sidemenu') ||
                element.classList?.contains('sidebar') ||
                element.classList?.contains('page-header')) {
              hasRelevantChanges = true;
            }
          }
        });
      });
      
      // Apply hiding/restoring if relevant changes detected
      if (hasRelevantChanges) {
        if (isDashboard) {
          debouncedApplyHiding();
        } else {
          restoreGrafanaUI();
        }
      }
    });

    // Start observing with subtree enabled to catch all changes
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true, // Enable subtree to catch all changes including navigation
        attributes: false, // Don't observe attribute changes to reduce overhead
      });
    } else {
      // Wait for body to exist
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true, // Enable subtree to catch all changes including navigation
          attributes: false, // Don't observe attribute changes to reduce overhead
        });
      });
    }

    // Set up a more frequent periodic check to catch navigation changes
    let lastCheckTime = 0;
    let lastViewParam = new URLSearchParams(window.location.search).get('view');
    let lastPathname = window.location.pathname;
    const checkInterval = setInterval(() => {
      // Check if view parameter changed
      const currentViewParam = new URLSearchParams(window.location.search).get('view');
      const currentPathname = window.location.pathname;
      
      // If URL changed, immediately apply UI hiding
      if (currentViewParam !== lastViewParam || currentPathname !== lastPathname) {
        lastViewParam = currentViewParam;
        lastPathname = currentPathname;
        // Use a small delay to let DOM update
        setTimeout(() => {
          checkAndApplyUIHiding();
          applyHiding();
        }, 50);
        return;
      }

      // Only hide if on dashboard page
      if (!isDashboardPage()) {
        // If not on dashboard, make sure UI is restored
        restoreGrafanaUI();
        return;
      }
      
      // Throttle: only check every 200ms to catch changes faster
      const now = Date.now();
      if (now - lastCheckTime < 200) {
        return;
      }
      lastCheckTime = now;
      
      // Quick check - only hide if elements are visible
      const headers = document.querySelectorAll('header');
      const sidebars = document.querySelectorAll('aside, [class*="sidemenu"], [class*="sidebar"]');
      
      // Always apply hiding if on dashboard page (don't wait for elements to appear)
      if (isDashboardPage()) {
        debouncedApplyHiding();
      }
      
      // Also check if elements are visible and need hiding
      if (headers.length > 0 || sidebars.length > 0) {
        let needsUpdate = false;
        
        // Check if any are visible
        headers.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
            const computed = window.getComputedStyle(htmlEl);
            if (computed.display !== 'none' && computed.visibility !== 'hidden') {
              needsUpdate = true;
            }
          }
        });
        
        sidebars.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.closest('[class*="app-plugin"]') && !htmlEl.closest('[class*="mindking"]')) {
            const computed = window.getComputedStyle(htmlEl);
            if (computed.display !== 'none' && computed.visibility !== 'hidden') {
              needsUpdate = true;
            }
          }
        });
        
        // Apply hiding if something needs to be hidden
        if (needsUpdate) {
          debouncedApplyHiding();
        }
      }
    }, 300); // Check every 300ms to catch navigation changes faster

    // Listen for view changes from the app
    window.addEventListener('view-changed', () => {
      setTimeout(() => {
        checkAndApplyUIHiding();
        applyHiding();
      }, 50);
    });

    // Listen for URL changes (browser back/forward)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        checkAndApplyUIHiding();
        applyHiding();
      }, 50);
    });

    // Listen for custom navigate events (from our app navigation)
    window.addEventListener('navigate', () => {
      setTimeout(() => {
        checkAndApplyUIHiding();
        applyHiding();
      }, 50);
    });

    // Also listen for hash changes (Grafana might use hash routing)
    window.addEventListener('hashchange', () => {
      setTimeout(() => {
        checkAndApplyUIHiding();
        applyHiding();
      }, 50);
    });

    // Watch for location changes using a more aggressive approach
    let lastUrl = window.location.href;
    const urlCheckInterval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(() => {
          checkAndApplyUIHiding();
          applyHiding();
        }, 100);
      }
    }, 200); // Check URL every 200ms

    // Clean up intervals on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
      clearInterval(urlCheckInterval);
    });
  }
}

export const plugin = new AppPlugin()
  .setRootPage(AppRootPage)
  .addConfigPage({
    title: 'Dashboard',
    icon: 'apps',
    id: 'dashboard',
    body: DashboardPage,
  })
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    id: 'config',
    body: ConfigPage,
  });

