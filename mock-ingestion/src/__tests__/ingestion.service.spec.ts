import { IngestionService } from '../ingestion.service';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(() => {
    service = new IngestionService();
  });

  it('should create an ingestion and return processing status', () => {
    const result = service.ingestDocument('doc-123', 'ingest-1');
    expect(result).toEqual({ id: 'ingest-1', status: 'processing' });
    expect(service['ingestions']['ingest-1'].status).toBe('processing');
    expect(service['ingestions']['ingest-1'].document).toBe('doc-123');
  });

  it('should use a generated id if not provided', () => {
    const result = service.ingestDocument('doc-456');
    expect(result.id).toBeDefined();
    expect(result.status).toBe('processing');
    expect(service['ingestions'][result.id].document).toBe('doc-456');
  });

  it('should update status and set embeddings after processing', async () => {
    jest.useFakeTimers();
    const result = service.ingestDocument('doc-789', 'ingest-2');
    jest.advanceTimersByTime(2000);
    // Simulate async callback
    await Promise.resolve();
    const record = service['ingestions']['ingest-2'];
    expect(['completed', 'failed']).toContain(record.status);
    if (record.status === 'completed') {
      expect(Array.isArray(record.embeddings)).toBe(true);
      expect(record.embeddings?.length).toBe(8);
    } else {
      expect(record.embeddings).toBeUndefined();
    }
    jest.useRealTimers();
  });

  it('should return status for a known ingestion', () => {
    service.ingestDocument('doc-abc', 'ingest-3');
    const status = service.getIngestionStatus('ingest-3');
    expect(status).toEqual({ id: 'ingest-3', status: 'processing' });
  });

  it('should return not found for unknown ingestion status', () => {
    expect(service.getIngestionStatus('no-such-id')).toEqual({ error: 'Not found' });
  });

  it('should return embeddings if completed', () => {
    service['ingestions']['ingest-4'] = {
      id: 'ingest-4',
      document: 'doc-emb',
      status: 'completed',
      embeddings: [1, 2, 3, 4, 5, 6, 7, 8],
    };
    const result = service.getEmbeddings('ingest-4');
    expect(result).toEqual({ id: 'ingest-4', embeddings: [1, 2, 3, 4, 5, 6, 7, 8] });
  });

  it('should return error if embeddings are missing or not completed', () => {
    service['ingestions']['ingest-5'] = {
      id: 'ingest-5',
      document: 'doc-none',
      status: 'failed',
    };
    expect(service.getEmbeddings('ingest-5')).toEqual({ error: 'Ingestion not completed yet' });
    expect(service.getEmbeddings('no-such-id')).toEqual({ error: 'Not found' });
  });
});
