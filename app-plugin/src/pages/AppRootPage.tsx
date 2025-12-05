// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { LandingPage } from '../components/LandingPage';
import { SiteManagerPage } from './SiteManagerPage';
import { ViewPresetPage } from './ViewPresetPage';
import { parseURLParams } from '../utils/urlParams';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const AppRootPage: React.FC<{ meta?: any }> = ({ meta }) => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isLoading, setIsLoading] = useState(true);

  // Function to determine view from URL
  const getViewFromURL = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      
      if (viewParam === 'dashboard' || viewParam === 'preset' || viewParam === 'landing') {
        return viewParam;
      }

      // Check for addPanelSet parameter (direct panel loading)
      const urlParams = parseURLParams();
      if (urlParams.addPanelSet) {
        return 'preset';
      }

      // Check pathname
      if (window.location.pathname.includes('/dashboard')) {
        return 'dashboard';
      }

      if (window.location.pathname.includes('/preset')) {
        return 'preset';
      }

      // Default to landing page if no view parameter
      return 'landing';
    } catch (error) {
      console.error('[AppRootPage] Error parsing URL:', error);
      return 'landing';
    }
  };

  useEffect(() => {
    // Initial load
    const view = getViewFromURL();
    setCurrentView(view);
    setIsLoading(false);

    // Listen for custom navigate events (from back button, etc.)
    const handleNavigate = (event: CustomEvent) => {
      setCurrentView(event.detail.view);
    };

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const view = getViewFromURL();
      setCurrentView(view);
    };

    // Listen for URL changes (when view parameter changes)
    const handleURLChange = () => {
      const view = getViewFromURL();
      setCurrentView(view);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    window.addEventListener('popstate', handlePopState);
    
    // Check URL periodically (fallback for direct URL changes)
    const urlCheckInterval = setInterval(handleURLChange, 100);

    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(urlCheckInterval);
    };
  }, []);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0c0e', color: '#fff' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Render based on view
  return (
    <ErrorBoundary>
      {currentView === 'dashboard' && <SiteManagerPage />}
      {currentView === 'preset' && <ViewPresetPage />}
      {currentView === 'landing' && (
        <LandingPage onViewSelect={(view) => {
          if (view === 'dashboard') {
            setCurrentView('dashboard');
            window.history.pushState({ view: 'dashboard' }, '', '/a/mindking-site-manager-dashboard?view=dashboard');
            // Dispatch event to trigger UI hiding
            window.dispatchEvent(new CustomEvent('view-changed', { detail: { view: 'dashboard' } }));
          } else if (view === 'preset') {
            setCurrentView('preset');
            window.history.pushState({ view: 'preset' }, '', '/a/mindking-site-manager-dashboard?view=preset');
            // Dispatch event to trigger UI hiding
            window.dispatchEvent(new CustomEvent('view-changed', { detail: { view: 'preset' } }));
          }
        }} />
      )}
    </ErrorBoundary>
  );
};

