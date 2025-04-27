import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Service for handling ingestion logic in the mock-ingestion microservice.
 * Responsible for simulating ingestion, status tracking, and embedding generation.
 */
interface IngestionRecord {
  id: string;
  document: string;
  status: 'processing' | 'completed' | 'failed';
  embeddings?: number[];
}

@Injectable()
export class IngestionService {
  private ingestions: Record<string, IngestionRecord> = {};

  /**
   * Simulates ingestion of a document.
   * @param document The document to ingest.
   * @param id Optional ingestion id. If not provided, a new UUID will be generated.
   * @returns An object containing the ingestion id and initial status.
   */
  ingestDocument(document: string, id?: string) {
    const ingestionId = id || randomUUID();
    this.ingestions[ingestionId] = {
      id: ingestionId,
      document,
      status: 'processing',
    };
    // Simulate async processing
    setTimeout(() => {
      // Randomly complete or fail
      const isSuccess = Math.random() > 0.2;
      this.ingestions[ingestionId].status = isSuccess ? 'completed' : 'failed';
      if (isSuccess) {
        // Generate dummy embeddings
        this.ingestions[ingestionId].embeddings = Array.from({ length: 8 }, () => Math.random());
      } else {
        this.ingestions[ingestionId].embeddings = undefined;
      }
    }, 2000);
    // Return processing immediately
    return { id: ingestionId, status: 'processing' };
  }

  /**
   * Retrieves the status of an ingestion by id.
   * @param id The ingestion id to check.
   * @returns The status of the ingestion, or an error if not found.
   */
  getIngestionStatus(id: string) {
    const record = this.ingestions[id];
    if (!record) {
      return { error: 'Not found' };
    }
    return { id, status: record.status };
  }

  /**
   * Retrieves embeddings for a completed ingestion.
   * @param id The ingestion id to retrieve embeddings for.
   * @returns The embeddings if ingestion is completed, or an error if not found or not completed.
   */
  getEmbeddings(id: string) {
    const record = this.ingestions[id];
    if (!record) {
      return { error: 'Not found' };
    }
    if (record.status !== 'completed') {
      return { error: 'Ingestion not completed yet' };
    }
    return { id, embeddings: record.embeddings };
  }
}
