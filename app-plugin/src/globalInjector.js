(function() {
  'use strict';
  
  // ABSOLUTE FIRST CHECK: If wrapper exists, clean duplicates and exit
  // const existingWrapper = document.getElementById('hive-selector-wrapper');
  // if (existingWrapper) {
  //   // Remove all duplicates immediately
  //   const allWrappers = document.querySelectorAll('[id="hive-selector-wrapper"]');
  //   for (let i = 1; i < allWrappers.length; i++) {
  //     allWrappers[i].remove();
  //   }
  //   return; // Exit immediately
  // }
  
  // Prevent multiple script executions - check multiple flags
  if (window.__HIVE_SELECTOR_ACTIVE__ || window.__HIVE_SELECTOR_RUNNING__ || window.__HIVE_SELECTOR_INIT__) {
    return;
  }
  
  // Set all flags immediately
  window.__HIVE_SELECTOR_ACTIVE__ = true;
  window.__HIVE_SELECTOR_RUNNING__ = true;
  window.__HIVE_SELECTOR_INIT__ = true;
  
  const isDashboardPage = window.location.pathname.includes('/d/') || 
                          window.location.pathname.includes('/dashboard/') ||
                          window.location.pathname === '/';
  
  if (!isDashboardPage) {
    window.__HIVE_SELECTOR_ACTIVE__ = false;
    window.__HIVE_SELECTOR_RUNNING__ = false;
    return;
  }
  

  // Single injection function - no retries, immediate
  function injectOnce() {
    // CRITICAL: Check if already exists - if yes, NEVER inject
    if (document.getElementById('hive-selector-wrapper')) {
      return true; // Already exists, do nothing
    }
    
    // Also check if we've already injected (global flag)
    if (window.__HIVE_SELECTOR_INJECTED__) {
      // Check if wrapper still exists in DOM
      if (document.getElementById('hive-selector-wrapper')) {
        return true;
      }
      // If flag is set but wrapper doesn't exist, clear flag and continue
      window.__HIVE_SELECTOR_INJECTED__ = false;
    }
    
    const timePicker = document.querySelector('[data-testid="time-picker"]') || 
                       document.querySelector('[data-testid*="time"]') ||
                       document.querySelector('button[aria-label*="time"]') ||
                       document.querySelector('button[aria-label*="Time"]');
    
    if (!timePicker || !timePicker.parentElement) {
      return false;
    }
    
    // Final check before creating
    if (document.getElementById('hive-selector-wrapper')) {
      return true;
    }
    
    // Create wrapper - no gap needed since there's no toggle button
    const wrapper = document.createElement('div');
    wrapper.id = 'hive-selector-wrapper';
    wrapper.setAttribute('data-hive-selector-wrapper', 'true');
    wrapper.style.cssText = 'display: inline-flex; align-items: center; margin-right: 16px;';
    
    // Create dropdown container
    const container = document.createElement('div');
    container.id = 'hive-selector-mount';
    container.setAttribute('data-hive-selector', 'true');
    container.style.marginRight = '16px';
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    container.style.width = '350px';
    container.style.height = '32px';
    
    // Always show the dropdown container
    container.style.display = 'inline-flex';
    
    // Add container directly to wrapper (no toggle button)
    wrapper.appendChild(container);
    
    // Insert wrapper
    timePicker.parentElement.insertBefore(wrapper, timePicker);
    
    // Set flag immediately - we've injected
    window.__HIVE_SELECTOR_INJECTED__ = true;
    
    // Store reference
    window.__HIVE_SELECTOR_WRAPPER__ = wrapper;
    
    // Load React component
    if (window.System && window.System.import) {
      window.System.import('/public/plugins/ravinderblockchain-hiveselector-app/module.js')
        .then(function() {
          if (window.__HIVE_SELECTOR_INJECT_REACT__) {
            window.__HIVE_SELECTOR_INJECT_REACT__(container);
          } else {
            renderFallbackDropdown(container);
          }
        })
        .catch(function() {
          renderFallbackDropdown(container);
        });
    } else {
      renderFallbackDropdown(container);
    }
    
    return true;
  }
  
  function renderFallbackDropdown(container) {
    container.innerHTML = `
      <div id="hive-selector-fallback" style="
        position: relative;
        display: inline-block;
        width: 100%;
        height: 32px;
      ">
        <div id="hive-selector-trigger" style="
          display: flex;
          align-items: center;
          padding: 0 12px;
          background: transparent;
          border: 1px solid var(--grafana-colors-border-medium, #2c2c34);
          border-radius: 4px;
          height: 32px;
          width: 100%;
          box-sizing: border-box;
        ">
          <span style="
            font-size: 14px;
            color: var(--grafana-colors-text-primary, #d8d9da);
            font-weight: 400;
            margin-right: 8px;
          ">Site/Group |</span>
          <span id="hive-selector-value" style="
            font-size: 14px;
            color: var(--grafana-colors-text-secondary, #9e9e9e);
            flex: 1;
          ">Select...</span>
          <span style="
            font-size: 12px;
            color: var(--grafana-colors-text-secondary, #9e9e9e);
            margin-left: 8px;
          ">▼</span>
        </div>
        <div id="hive-selector-dropdown-menu" style="
          display: block;
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: var(--grafana-colors-background-secondary, #1f1f23);
          border: 1px solid var(--grafana-colors-border-medium, #2c2c34);
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 9999;
          min-width: 350px;
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        ">
          <div style="padding: 12px; color: var(--grafana-colors-text-secondary, #9e9e9e);">
            Loading React component...
          </div>
        </div>
      </div>
    `;
  }
  
  // Global cleanup function - removes all duplicates
  function removeDuplicates() {
    const allWrappers = document.querySelectorAll('[id="hive-selector-wrapper"]');
    if (allWrappers.length > 1) {
      // Keep only the first one
      for (let i = 1; i < allWrappers.length; i++) {
        allWrappers[i].remove();
      }
      // Set injected flag if we kept one
      if (allWrappers.length > 0) {
        window.__HIVE_SELECTOR_INJECTED__ = true;
      }
    } else if (allWrappers.length === 1) {
      // Wrapper exists, set flag
      window.__HIVE_SELECTOR_INJECTED__ = true;
    }
  }
  
  // Expose cleanup globally
  window.__HIVE_SELECTOR_CLEANUP__ = removeDuplicates;
  
  // Single MutationObserver - removes duplicates immediately
  const observer = new MutationObserver(() => {
    removeDuplicates();
  });
  
  // Observe document for any changes
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Single interval - only for cleanup, no injection
  setInterval(removeDuplicates, 100);
  
  // Try injection once - only if not already injected
  if (!window.__HIVE_SELECTOR_INJECTED__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Check again before injecting
        if (!document.getElementById('hive-selector-wrapper')) {
          injectOnce();
        }
      });
    } else {
      // Check before injecting
      if (!document.getElementById('hive-selector-wrapper')) {
        injectOnce();
      }
    }
  }
  
  // Handle navigation - ONLY cleanup duplicates, NEVER reinject if wrapper exists
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    // Only cleanup duplicates, don't inject if wrapper exists
    removeDuplicates();
    // Only inject if wrapper doesn't exist AND we haven't injected before
    const wrapper = document.getElementById('hive-selector-wrapper');
    if (!wrapper && !window.__HIVE_SELECTOR_INJECTED__) {
      injectOnce();
    }
  };
  
  window.addEventListener('popstate', () => {
    // Only cleanup duplicates, don't inject if wrapper exists
    removeDuplicates();
    // Only inject if wrapper doesn't exist AND we haven't injected before
    const wrapper = document.getElementById('hive-selector-wrapper');
    if (!wrapper && !window.__HIVE_SELECTOR_INJECTED__) {
      injectOnce();
    }
  });
  
  // Watch route changes - ONLY cleanup, don't reinject
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      // Only cleanup duplicates
      removeDuplicates();
      // Only inject if wrapper doesn't exist AND we haven't injected before
      const wrapper = document.getElementById('hive-selector-wrapper');
      if (!wrapper && !window.__HIVE_SELECTOR_INJECTED__) {
        injectOnce();
      }
    }
  }, 300);
  
})();
