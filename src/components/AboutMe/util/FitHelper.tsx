/**
 * @file FitHelper.tsx
 * @architecture Domain Logic / Pure Functions
 * @description 
 * Extracts business logic and deterministic calculations from the Presentation Layer (FitCheck.tsx).
 * By isolating these evaluations as Pure Functions, we achieve:
 * 1. O(1) Unit Testability (No DOM mocking required)
 * 2. Strict Separation of Concerns (UI only paints; Helpers evaluate)
 * 3. Global Reusability (Scores can be generated for PDFs, Terminals, or APIs)
 */

import React from 'react';
import { 
  VscTerminal, 
  VscTelescope, 
  VscRocket,   // <-- Swapped VscZap for VscRocket to fix the type error!
  VscShield, 
  VscOrganization, 
  VscWarning 
} from 'react-icons/vsc';

/**
 * Maps a dominant psychological vector to its corresponding semantic UI icon.
 * @param {string} dominantVector - The highest scoring category from the assessment.
 * @returns {JSX.Element} - The semantic SVG icon.
 */
export const getResonanceIcon = (dominantVector: string) => {
  switch (dominantVector) {
    case 'tech': return <VscTerminal />;
    case 'vision': return <VscTelescope />;
    case 'velocity': return <VscRocket />; // <-- Updated here
    case 'experience': return <VscShield />;
    case 'affinity': return <VscOrganization />;
    default: return <VscWarning />;
  }
};

/**
 * Evaluates raw quantitative data (scores) into qualitative semantic feedback.
 * @param {string} dominantVector - The highest scoring category.
 * @param {number} percentage - The calculated alignment match (0-100).
 * @returns {string} - The contextual, enterprise-themed output message.
 */
export const getResultQuip = (dominantVector: string, percentage: number) => {
  // CRITICAL PATH: Threshold evaluation
  if (percentage < 45) {
    return "CRITICAL_MISMATCH: Current operational parameters do not align with optimal deployment metrics. Recommend recalibration or alternative routing.";
  }

  // Determine magnitude of resonance
  const highMatch = percentage >= 80;

  // Domain evaluation based on vector type
  switch (dominantVector) {
    case 'tech':
      return highMatch 
        ? "SYNERGY_OPTIMIZED: Exceptional alignment in deep technical grit. Ready to architect and deploy complex systems at scale."
        : "SYNERGY_DETECTED: Solid baseline for technical execution and architectural development.";
    case 'vision':
      return highMatch 
        ? "SYNERGY_OPTIMIZED: Exceptional strategic foresight. Perfectly aligned to map uncharted product territories."
        : "SYNERGY_DETECTED: Acceptable alignment for long-term strategic planning and product vision.";
    case 'velocity':
      return highMatch 
        ? "SYNERGY_OPTIMIZED: Maximum execution speed detected. Frictionless delivery protocols ready for deployment."
        : "SYNERGY_DETECTED: Capable of maintaining high-paced iteration cycles and agile delivery.";
    case 'experience':
      return highMatch 
        ? "SYNERGY_OPTIMIZED: Veteran operational stability recognized. Ready to lead mission-critical deployments."
        : "SYNERGY_DETECTED: Sufficient baseline experience for managing standard operational risks.";
    case 'affinity':
      return highMatch 
        ? "SYNERGY_OPTIMIZED: Maximum cultural resonance. Team synchronization and human-centric engineering at optimal levels."
        : "SYNERGY_DETECTED: Positive alignment with core communication and team integration protocols.";
    default:
      return "ANALYSIS_COMPLETE: System ready for next directive.";
  }
};