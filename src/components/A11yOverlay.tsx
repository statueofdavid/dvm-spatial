import React from 'react';
import { BRAIN_REGIONS } from '../data/regions';
import styles from './A11yOverlay.module.css';

interface A11yOverlayProps {
  onFocusRegion: (id: string | null) => void;
  onSelectRegion: (id: string | null) => void;
}

export default function A11yOverlay({ onFocusRegion, onSelectRegion }: A11yOverlayProps) {
  return (
    <div className={styles.container}>
      {BRAIN_REGIONS.map((region) => (
        <button
          key={`a11y-${region.id}`}
          className={styles.srOnly}
          onFocus={() => onFocusRegion(region.id)}
          onBlur={() => onFocusRegion(null)}
          onClick={() => onSelectRegion(region.id)}
          aria-label={`Maps to ${region.label} section`}
        >
          {region.label}
        </button>
      ))}
    </div>
  );
}