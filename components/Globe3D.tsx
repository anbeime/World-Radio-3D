import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { CountryGeo } from '../types';

// GeoJSON source for country borders
const GEOJSON_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

interface Globe3DProps {
  onCountrySelect: (countryCode: string, countryName: string, polygon: any) => void;
  selectedCountryCode: string | null;
}

const Globe3D: React.FC<Globe3DProps> = ({ onCountrySelect, selectedCountryCode }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState<object | null>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(setCountries);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  // Stop rotation when user interacts
  const handleGlobeClick = () => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
    }
  };

  const handlePolygonClick = useCallback((polygon: any) => {
    const properties = (polygon as CountryGeo).properties;
    const countryCode = properties.ISO_A2;
    const countryName = properties.ADMIN;
    
    // Focus on the clicked country
    if (globeEl.current) {
        // Calculate centroid roughly from bbox if available, or just rely on click point
        // But polygonClick gives us the polygon data.
        // We can just use the click event raycast, but focusing on the polygon is nicer.
        const bbox = polygon.bbox; 
        if(bbox) {
             const lat = (bbox[1] + bbox[3]) / 2;
             const lng = (bbox[0] + bbox[2]) / 2;
             globeEl.current.pointOfView({ lat, lng, altitude: 1.8 }, 1000);
        }
        globeEl.current.controls().autoRotate = false;
    }
    
    onCountrySelect(countryCode, countryName, polygon);
  }, [onCountrySelect]);

  const getPolygonLabel = useCallback((d: any) => `
      <div style="
        background: rgba(0,0,0,0.8); 
        color: white; 
        padding: 4px 8px; 
        border-radius: 4px; 
        font-family: 'Space Grotesk', sans-serif;
        font-size: 12px;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        ${d.properties.ADMIN}
      </div>
    `, []);

  return (
    <div className="cursor-move" onMouseDown={handleGlobeClick} onTouchStart={handleGlobeClick}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        polygonsData={countries.features}
        polygonAltitude={d => d === hoverD || (d as any).properties.ISO_A2 === selectedCountryCode ? 0.12 : 0.06}
        polygonCapColor={d => (d as any).properties.ISO_A2 === selectedCountryCode 
            ? 'rgba(56, 189, 248, 0.6)' 
            : d === hoverD 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0)'}
        polygonSideColor={() => 'rgba(255, 255, 255, 0.05)'}
        polygonStrokeColor={() => '#111'}
        polygonLabel={getPolygonLabel}
        onPolygonHover={setHoverD}
        onPolygonClick={handlePolygonClick}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.25}
      />
    </div>
  );
};

export default Globe3D;
