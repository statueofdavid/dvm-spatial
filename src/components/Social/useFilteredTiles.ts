import { useMemo } from 'react';
import { SocialTiles } from '../../data/SocialTiles';

export function useFilteredTiles(activeFilter: string, telemetry: any) {
  return useMemo(() => {
    return [...SocialTiles]
      .filter(t => activeFilter === 'ALL' || t.category.toUpperCase() === activeFilter)
      .sort((a, b) => {
        // Your original sorting logic is completely restored!
        const statusA = telemetry[a.id]?.status === 'ONLINE' ? 0 : 1;
        const statusB = telemetry[b.id]?.status === 'ONLINE' ? 0 : 1;
        return statusA - statusB;
      });
  }, [activeFilter, telemetry]); // <-- Don't forget to add telemetry to the dependency array!
}