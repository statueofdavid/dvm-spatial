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

export interface AudioSampleRecord {
  id: string;
  name: string;
  data_base64: string;
  duration: number;
  pitch: number;
  cutoff: number;
  resonance: number;
  drive: number;
  decay: number;
  trim_start: number;
  trim_end: number;
  key_binding: string;
  slot_index: number; // 0-7 = mapped to pad, -1 = unmapped in library
  created_at?: string;
}

let initAudioPromise: Promise<void> | null = null;

export async function initAudioDatabase(): Promise<void> {
  if (initAudioPromise) return initAudioPromise;

  initAudioPromise = (async () => {
    // 1. Wait for base PGlite instance and journal schema to finish
    await initDatabase();

    // 2. Ensure the base audio_samples table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS audio_samples (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data_base64 TEXT NOT NULL,
        duration REAL DEFAULT 0,
        pitch REAL DEFAULT 1.0,
        cutoff REAL DEFAULT 20000,
        resonance REAL DEFAULT 1.0,
        drive REAL DEFAULT 0,
        decay REAL DEFAULT 1.0,
        trim_start REAL DEFAULT 0,
        trim_end REAL DEFAULT 1.0,
        key_binding TEXT,
        slot_index INTEGER DEFAULT -1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Migration check: add slot_index if the table was created before this column existed
    await db.exec(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audio_samples' AND column_name = 'slot_index'
        ) THEN
          ALTER TABLE audio_samples ADD COLUMN slot_index INTEGER DEFAULT -1;
        END IF;
      END $$;
    `);

    console.log('[DB] audio_samples schema verified with slot_index.');
  })();

  return initAudioPromise;
}

export async function getAudioSamples(): Promise<AudioSampleRecord[]> {
  await initAudioDatabase();
  try {
    const res = await db.query<AudioSampleRecord>(
      'SELECT * FROM audio_samples ORDER BY slot_index ASC, created_at ASC;'
    );
    console.log(`[DB] Fetched ${res.rows.length} audio sample records.`);
    return res.rows;
  } catch (err) {
    console.error('[DB] Failed to query audio_samples:', err);
    return [];
  }
}

export async function saveAudioSample(sample: AudioSampleRecord): Promise<void> {
  await initAudioDatabase();
  if (!sample.data_base64) {
    console.error('[DB] Refusing to persist corrupt/empty sample:', sample.id);
    return;
  }

  await db.query(
    `
    INSERT INTO audio_samples (
      id, name, data_base64, duration, pitch, cutoff, resonance, 
      drive, decay, trim_start, trim_end, key_binding, slot_index
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      data_base64 = EXCLUDED.data_base64,
      duration = EXCLUDED.duration,
      pitch = EXCLUDED.pitch,
      cutoff = EXCLUDED.cutoff,
      resonance = EXCLUDED.resonance,
      drive = EXCLUDED.drive,
      decay = EXCLUDED.decay,
      trim_start = EXCLUDED.trim_start,
      trim_end = EXCLUDED.trim_end,
      key_binding = EXCLUDED.key_binding,
      slot_index = EXCLUDED.slot_index;
  `,
    [
      sample.id,
      sample.name,
      sample.data_base64,
      sample.duration,
      sample.pitch,
      sample.cutoff,
      sample.resonance,
      sample.drive,
      sample.decay,
      sample.trim_start,
      sample.trim_end,
      sample.key_binding,
      sample.slot_index,
    ]
  );
  console.log(`[DB] Saved sample ${sample.id} ("${sample.name}") mapped to slot ${sample.slot_index}`);
}

export async function deleteAudioSample(id: string): Promise<void> {
  await initAudioDatabase();
  await db.query('DELETE FROM audio_samples WHERE id = $1;', [id]);
  console.log(`[DB] Deleted sample: ${id}`);
}