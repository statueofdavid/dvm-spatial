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
  VscRocket,
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
    case 'Tech': return <VscTerminal />;
    case 'Vision': return <VscTelescope />;
    case 'Velocity': return <VscRocket />;
    case 'Experience': return <VscShield />;
    case 'Affinity': return <VscOrganization />;
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
  if (percentage < 45) {
    return "Misaligned: Current parameters do not map well to what is required to meet your needs. Recommend recalibration or alternative routing.";
  }

  // Determine magnitude of resonance
  const highMatch = percentage >= 80;

  // Domain evaluation based on vector type
switch (dominantVector) {
    case 'tech':
      return highMatch 
        ? "Exceptional alignment in deep technical grit, architectural scalability, and complex system deployment."
        : "Solid baseline established for technical execution and ongoing architectural development.";
    case 'vision':
      return highMatch 
        ? "Exceptional strategic foresight. Experience profiles are optimally aligned to map uncharted product territories."
        : "Acceptable baseline alignment for long-term strategic planning and product visioning.";
    case 'velocity':
      return highMatch 
        ? "Maximum execution speed detected. Well-defined delivery protocols primed for frictionless iterative deployment."
        : "Demonstrated capability in maintaining high-paced iteration cycles and agile delivery structures.";
    case 'experience':
      return highMatch 
        ? "Veteran operational stability recognized, fully prepared to govern mission-critical deployments."
        : "Sufficient baseline experience identified for managing standard enterprise operational risks.";
    case 'affinity':
      return highMatch 
        ? "Maximum cultural resonance achieved. Complete team synchronization and human-centric engineering alignment."
        : "Positive foundational alignment with core communication patterns and team integration protocols.";
    default:
      return "Analysis complete. System stabilized for subsequent operational directives.";
  }
};