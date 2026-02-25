/**
 * In-memory scan store (MVP).
 * In production, replace with PostgreSQL.
 */
import { ScanRecord } from "./types";

// Global singleton store
const globalForStore = globalThis as typeof globalThis & {
  scanStore: Map<string, ScanRecord>;
};

if (!globalForStore.scanStore) {
  globalForStore.scanStore = new Map<string, ScanRecord>();
}

export const scanStore = globalForStore.scanStore;

export function getRecord(scanToken: string): ScanRecord | undefined {
  return scanStore.get(scanToken);
}

export function setRecord(scanToken: string, record: ScanRecord): void {
  scanStore.set(scanToken, record);
}

export function updateRecord(scanToken: string, update: Partial<ScanRecord>): void {
  const existing = scanStore.get(scanToken);
  if (existing) {
    scanStore.set(scanToken, { ...existing, ...update });
  }
}
