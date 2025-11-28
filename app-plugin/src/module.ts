// @ts-nocheck
import { AppPlugin } from '@grafana/data';

// STRICT: Prevent multiple module loads - check and set immediately
if ((window as any).__HIVE_SELECTOR_MODULE_LOADED__) {
  // Module already loaded, don't load again
} else {
  (window as any).__HIVE_SELECTOR_MODULE_LOADED__ = true;
  // Import only once
  import('./injectControlBar');
  import('./globalInjector');
}

export const plugin = new AppPlugin()
  .setRootPage(() => null);
