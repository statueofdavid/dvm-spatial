import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { EncryptedPayload, VaultManifest } from '../src/engine/vaultTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target images to encrypt into the binary vault
const ASSET_DIR = path.resolve(__dirname, '../public/images');
const OUTPUT_FILE = path.resolve(__dirname, '../public/vault/timeline.bin');

const MASTER_SECRET = 'dvm-spatial-offline-vault-key-seed-2026';
const SALT = Buffer.from('dvm-salt-v1');

function deriveKey(): Buffer {
  return crypto.pbkdf2Sync(MASTER_SECRET, SALT, 100000, 32, 'sha256');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function encryptFile(filePath: string, key: Buffer): EncryptedPayload {
  const fileBytes = fs.readFileSync(filePath);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(fileBytes), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([ciphertext, authTag]);

  return {
    iv: iv.toString('base64'),
    ciphertext: combined.toString('base64'),
    mimeType: getMimeType(filePath),
  };
}

function buildVault(): void {
  if (!fs.existsSync(ASSET_DIR)) {
    console.warn(`[Vault] Source directory does not exist: ${ASSET_DIR}. Creating empty vault.`);
    const outDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({}), 'utf-8');
    return;
  }

  const key = deriveKey();
  const manifest: VaultManifest = {};
  const files = fs.readdirSync(ASSET_DIR);

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const fullPath = path.join(ASSET_DIR, file);
    if (!fs.statSync(fullPath).isFile()) continue;

    const keyName = path.parse(file).name;
    console.log(`[Vault] Encrypting asset: ${keyName} (${file})`);
    manifest[keyName] = encryptFile(fullPath, key);
  }

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest), 'utf-8');
  console.log(`[Vault] Vault binary bundle written to ${OUTPUT_FILE}`);
}

buildVault();