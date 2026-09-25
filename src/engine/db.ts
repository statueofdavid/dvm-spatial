import { PGlite } from '@electric-sql/pglite';
import { filterWordCloud, WordCloudItem } from '../utils/sanitizer';

// Persistent storage inside IndexedDB
export const db = new PGlite('idb://dvm-spatial-db');

let initPromise: Promise<void> | null = null;

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await db.waitReady;

    await db.exec(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        raw_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default starter words if empty so the 3D scene isn't blank
    const countResult = await db.query<{ count: string }>('SELECT count(*) FROM journal_entries;');
    if (parseInt(countResult.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO journal_entries (raw_text) VALUES 
          ('welcome to the decentralized neural canvas'),
          ('wasm postgres running locally in the browser'),
          ('peer to peer communal spatial engine');
      `);
    }

    console.log('[SYS] Embedded PGlite mounted & initialized.');
  })();

  return initPromise;
}

export async function addJournalEntry(rawText: string): Promise<void> {
  await initDatabase();
  const trimmed = rawText.trim();
  if (!trimmed) throw new Error('Missing or invalid raw_text');

  await db.query(
    'INSERT INTO journal_entries (raw_text) VALUES ($1);',
    [trimmed]
  );
}

export async function getWordCloud(): Promise<WordCloudItem[]> {
  await initDatabase();

  const result = await db.query<{ word: string; size: number | string }>(`
    SELECT NULLIF(regexp_replace(lower(word), '[^a-z0-9]', '', 'g'), '') as word, count(*) as size
    FROM (
      SELECT regexp_split_to_table(raw_text, '\\s+') as word
      FROM journal_entries
    ) w
    WHERE word IS NOT NULL AND word != ''
    GROUP BY NULLIF(regexp_replace(lower(word), '[^a-z0-9]', '', 'g'), '')
    HAVING NULLIF(regexp_replace(lower(word), '[^a-z0-9]', '', 'g'), '') IS NOT NULL;
  `);

  return filterWordCloud(result.rows);
}