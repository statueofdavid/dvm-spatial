export const get3x3PuzzlePath = (index: number): string => {
  // Calculate grid position (0-2 for both row and col)
  const row = Math.floor(index / 3);
  const col = index % 3;

  const isTopEdge = row === 0;
  const isBottomEdge = row === 2;
  const isLeftEdge = col === 0;
  const isRightEdge = col === 2;

  // Interlocking logic: Determines if a piece should push out (tab) or pull in (hole)
  const hasRightTab = (col === 0 && row % 2 === 0) || (col === 1 && row % 2 !== 0);
  const hasBottomTab = (row === 0 && col % 2 === 0) || (row === 1 && col % 2 !== 0);
  const prevBottomTab = (row === 1 && col % 2 === 0) || (row === 2 && col % 2 !== 0);
  const prevRightTab = (col === 1 && row % 2 === 0) || (col === 2 && row % 2 !== 0);

  // 1. Top Edge
  let top = `M 0,0 L 100,0`;
  if (!isTopEdge) {
    top = prevBottomTab 
      ? `M 0,0 L 35,0 C 35,10 25,10 25,20 C 25,40 75,40 75,20 C 75,10 65,10 65,0 L 100,0` // Hole
      : `M 0,0 L 35,0 C 35,-10 25,-10 25,-20 C 25,-40 75,-40 75,-20 C 75,-10 65,-10 65,0 L 100,0`; // Tab
  }

  // 2. Right Edge
  let right = `L 100,100`;
  if (!isRightEdge) {
    right = hasRightTab 
      ? `L 100,35 C 110,35 110,25 120,25 C 140,25 140,75 120,75 C 110,75 110,65 100,65 L 100,100` // Tab
      : `L 100,35 C 90,35 90,25 80,25 C 60,25 60,75 80,75 C 90,75 90,65 100,65 L 100,100`; // Hole
  }

  // 3. Bottom Edge
  let bottom = `L 0,100`;
  if (!isBottomEdge) {
    bottom = hasBottomTab 
      ? `L 65,100 C 65,110 75,110 75,120 C 75,140 25,140 25,120 C 25,110 35,110 35,100 L 0,100` // Tab
      : `L 65,100 C 65,90 75,90 75,80 C 75,60 25,60 25,80 C 25,90 35,90 35,100 L 0,100`; // Hole
  }

  // 4. Left Edge
  let left = `L 0,0`;
  if (!isLeftEdge) {
    left = prevRightTab 
      ? `L 0,65 C 10,65 10,75 20,75 C 40,75 40,25 20,25 C 10,25 10,35 0,35 L 0,0` // Hole
      : `L 0,65 C -10,65 -10,75 -20,75 C -40,75 -40,25 -20,25 C -10,25 -10,35 0,35 L 0,0`; // Tab
  }

  return `${top} ${right} ${bottom} ${left} Z`;
};