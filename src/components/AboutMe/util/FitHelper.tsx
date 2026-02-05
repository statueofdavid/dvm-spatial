import React from 'react';
import { 
  VscTerminal, 
  VscTelescope, 
  VscRocket, 
  VscVerified, 
  VscRadioTower, 
  VscDebugDisconnect 
} from 'react-icons/vsc';
import { 
  WeightVector, 
  UserBucket, 
  RESULT_MATRIX 
} from '../../../data/FitCheckConst';

/**
 * DETERMINES THE ICON BASED ON THE HIGHEST SCORING VECTOR
 * This logic is pulled out of the main component to keep the JSX clean.
 */
export const getResonanceIcon = (dominantVector: keyof WeightVector, fitPercentage: number) => {
  // If the score is too low, we return the 'Disconnect' icon regardless of the vector
  if (fitPercentage < 45) {
    return <VscDebugDisconnect size={140} color="#ff810a" />;
  }

  // Map each weight category to a semantic icon
  switch (dominantVector) {
    case 'tech': 
      return <VscTerminal size={140} color="#ff810a" />;
    case 'vision': 
      return <VscTelescope size={140} color="#ff810a" />;
    case 'velocity': 
      return <VscRocket size={140} color="#ff810a" />;
    case 'experience': 
      return <VscVerified size={140} color="#ff810a" />;
    case 'affinity': 
      return <VscRadioTower size={140} color="#ff810a" />;
    default: 
      return <VscVerified size={140} color="#ff810a" />;
  }
};

/**
 * FETCHES THE NARRATIVE STRING FROM THE RESULT MATRIX
 * This replaces the complex conditional logic previously in the component.
 */
export const getResultQuip = (
  bucket: UserBucket | null, 
  dominantVector: keyof WeightVector, 
  percentage: number
): string => {
  // Low-resonance threshold check
  if (percentage < 45) {
    return "Our protocols might be out of sync. But friction often sparks the best R&D. Perhaps we bridge the gap?";
  }

  // Locate the correct narrative bucket, falling back to DEFAULT if needed
  const category = bucket ? RESULT_MATRIX[bucket] : RESULT_MATRIX.DEFAULT;
  
  return category[dominantVector];
};