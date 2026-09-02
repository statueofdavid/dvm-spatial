import React from 'react';
import { BRAIN_REGIONS } from '../data/regions';
import styles from './A11yOverlay.module.css';

export default function A11yOverlay({ onFocusRegion, onSelectRegion }) {
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