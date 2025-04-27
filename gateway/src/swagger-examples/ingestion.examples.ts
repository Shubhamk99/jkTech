export const triggerIngestionRequestExample = {
  ingestion: {
    summary: 'Trigger Ingestion',
    value: {
      documentId: 'doc1',
    },
  },
};

export const triggerIngestionResponseExample = {
  ingestion: {
    summary: 'Ingestion Triggered',
    value: {
      id: 'ingest1',
      documentId: 'doc1',
      status: 'pending',
      startedAt: '2025-04-27T17:53:00.000Z',
    },
  },
};

export const ingestionStatusResponseExample = {
  ingestion: {
    summary: 'Ingestion Status',
    value: {
      id: 'ingest1',
      documentId: 'doc1',
      status: 'completed',
      startedAt: '2025-04-27T17:53:00.000Z',
      completedAt: '2025-04-27T17:54:00.000Z',
    },
  },
};

export const embeddingsResponseExample = {
  embeddings: {
    summary: 'Document Embeddings',
    value: {
      documentId: 'doc1',
      vectors: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
    },
  },
};

export const listIngestionsResponseExample = {
  ingestions: {
    summary: 'List Ingestions',
    value: [
      {
        id: 'ingest1',
        documentId: 'doc1',
        status: 'completed',
      },
      {
        id: 'ingest2',
        documentId: 'doc2',
        status: 'pending',
      },
    ],
  },
};
