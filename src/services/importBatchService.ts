import { ImportBatch } from '../types';
import { emitDataChange } from './dataEvents';

const KEY = 'arya_ai_import_batches_v1';

interface Store {
  counter: number;
  batches: ImportBatch[];
}

class ImportBatchService {
  private read(): Store {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { counter: 0, batches: [] };
      return JSON.parse(raw) as Store;
    } catch {
      return { counter: 0, batches: [] };
    }
  }

  private write(store: Store): void {
    localStorage.setItem(KEY, JSON.stringify(store));
    emitDataChange();
  }

  public getAll(): ImportBatch[] {
    return this.read().batches;
  }

  public getById(id: string): ImportBatch | null {
    return this.read().batches.find((b) => b.id === id) || null;
  }

  /** Creates a new batch. The counter never goes backwards, so IDs are never reused. */
  public create(input: {
    fileName: string;
    uploadedById: string;
    uploadedByName: string;
    recordCount: number;
    skippedCount: number;
    id?: string;
  }): ImportBatch {
    const store = this.read();
    store.counter += 1;
    const num = String(store.counter).padStart(3, '0');
    const batch: ImportBatch = {
      id: input.id || `BATCH-${num}`,
      label: `Import Batch ${num}`,
      fileName: input.fileName,
      uploadedAt: new Date().toISOString(),
      uploadedById: input.uploadedById,
      uploadedByName: input.uploadedByName,
      recordCount: input.recordCount,
      skippedCount: input.skippedCount
    };
    store.batches.unshift(batch);
    this.write(store);
    return batch;
  }

  /** Reserve the next batch id before records are written (so records can be tagged). */
  public peekNextId(): string {
    return `BATCH-${String(this.read().counter + 1).padStart(3, '0')}`;
  }

  public updateCounts(id: string, recordCount: number, skippedCount: number): void {
    const store = this.read();
    const b = store.batches.find((x) => x.id === id);
    if (!b) return;
    b.recordCount = recordCount;
    b.skippedCount = skippedCount;
    this.write(store);
  }

  public remove(id: string): void {
    const store = this.read();
    store.batches = store.batches.filter((b) => b.id !== id);
    this.write(store);
  }

  public clearAll(): void {
    // keep the counter so IDs remain unique across clean slates
    const store = this.read();
    store.batches = [];
    this.write(store);
  }
}

export const importBatchService = new ImportBatchService();
