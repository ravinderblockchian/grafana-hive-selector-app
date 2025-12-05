// @ts-nocheck
import React, { useEffect } from 'react';
import { AppRootPage } from './AppRootPage';

/**
 * Dashboard page component that shows the landing page
 * This allows users to select a view, and only when they select a view does it go full screen
 */
export const DashboardPage: React.FC = () => {
  useEffect(() => {
    // Ensure we're on the landing page (no view parameter)
    const currentUrl = window.location.href;
    if (currentUrl.includes('view=')) {
      // Remove view parameter to show landing page
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Show the landing page (AppRootPage will handle showing landing when no view param)
  return <AppRootPage />;
};

