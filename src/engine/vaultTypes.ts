export interface EncryptedPayload {
  iv: string;         // Base64-encoded 12-byte initialization vector
  ciphertext: string; // Base64-encoded AES-GCM ciphertext
  mimeType: string;
}

export type VaultManifest = Record<string, EncryptedPayload>;

export interface MediaVaultRecord {
  asset_key: string;
  mime_type: string;
  iv: string;
  ciphertext: string;
  created_at?: string;
}