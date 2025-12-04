// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useTheme2 } from '@grafana/ui';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Configure default icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SiteLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity?: number;
  ipAddress?: string;
  state?: string;
  country?: string;
}

interface SiteMapProps {
  sites?: SiteLocation[];
  selectedSiteId?: string | null;
  onSiteClick?: (siteId: string) => void;
  height?: number | string; // Allow custom height
}

export const SiteMap: React.FC<SiteMapProps> = ({
  sites = [],
  selectedSiteId = null,
  onSiteClick,
  height = '500px', // Default height, but can be overridden
}) => {
  const theme = useTheme2();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Calculate center from sites or use default
  const center: [number, number] = sites.length > 0
    ? [
        sites.reduce((sum, s) => sum + s.lat, 0) / sites.length,
        sites.reduce((sum, s) => sum + s.lng, 0) / sites.length,
      ]
    : [47.6062, -122.3321]; // Default to Seattle area

  const getSeverityColor = (severity?: number): string => {
    switch (severity) {
      case 5:
        return '#E02F44'; // Critical - Red
      case 4:
        return '#F79520'; // Major - Orange
      case 3:
        return '#FADE2A'; // Minor - Yellow
      case 2:
        return '#A352CC'; // Warning - Purple
      case 1:
        return '#73BF69'; // Normal - Green
      default:
        return '#5794F2'; // Info - Blue
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center,
      zoom: sites.length > 0 ? 6 : 10,
      zoomControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom when sites change
  useEffect(() => {
    if (mapInstanceRef.current && sites.length > 0) {
      const bounds = L.latLngBounds(sites.map(s => [s.lat, s.lng] as [number, number]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sites.length]);

  // Resize map when container size changes (for panel expansion)
  useEffect(() => {
    if (mapInstanceRef.current && mapRef.current) {
      // Use a small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [height]);

  // Update markers when sites change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    sites.forEach((site) => {
      const isSelected = selectedSiteId === site.id;
      const color = getSeverityColor(site.severity);

      // Create custom icon with severity color
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            border-radius: 50%;
            background-color: ${color};
            border: 3px solid ${isSelected ? '#fff' : theme.colors.background.primary};
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '12px'};
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
          ">
            ${isSelected ? '●' : '○'}
          </div>
        `,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });

      const marker = L.marker([site.lat, site.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current!);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <strong style="font-size: 14px; color: ${theme.colors.text.primary};">${site.name}</strong>
          ${site.ipAddress ? `<div style="margin-top: 4px; color: ${theme.colors.text.secondary}; font-size: 12px;">IP: ${site.ipAddress}</div>` : ''}
          ${site.state ? `<div style="color: ${theme.colors.text.secondary}; font-size: 12px;">State: ${site.state}</div>` : ''}
          ${site.country ? `<div style="color: ${theme.colors.text.secondary}; font-size: 12px;">Country: ${site.country}</div>` : ''}
          ${site.severity !== undefined ? `<div style="margin-top: 4px; color: ${color}; font-size: 12px; font-weight: bold;">Severity: ${site.severity}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle click
      marker.on('click', () => {
        onSiteClick?.(site.id);
      });

      markersRef.current.push(marker);
    });

    // If a site is selected, open its popup
    if (selectedSiteId) {
      const selectedMarker = markersRef.current.find((_, index) => sites[index]?.id === selectedSiteId);
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [sites, selectedSiteId, theme, onSiteClick]);

  const mapHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={{
        width: '100%',
        height: mapHeight,
        minHeight: '400px', // Minimum height for usability
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.medium}`,
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      {sites.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: theme.colors.text.secondary,
            fontSize: '14px',
            textAlign: 'center',
            zIndex: 1000,
            background: theme.colors.background.primary,
            padding: '16px 24px',
            borderRadius: '4px',
            border: `1px solid ${theme.colors.border.medium}`,
          }}
        >
          <div style={{ marginBottom: '8px' }}>🗺️ Interactive Site Map</div>
          <div style={{ fontSize: '12px' }}>
            Add site data with latitude and longitude to view on map
          </div>
        </div>
      )}
    </div>
  );
};

