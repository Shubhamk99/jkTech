export const findAllDocumentsResponseExample = {
  documents: {
    summary: 'List Documents',
    value: [
      {
        id: 'doc1',
        title: 'Document 1',
        ownerId: '1',
        createdAt: '2025-04-27T17:50:00.000Z',
        fileUrl: '/uploads/doc1.pdf',
      },
      {
        id: 'doc2',
        title: 'Document 2',
        ownerId: '2',
        createdAt: '2025-04-27T17:51:00.000Z',
        fileUrl: '/uploads/doc2.pdf',
      },
    ],
  },
};

export const findOneDocumentResponseExample = {
  document: {
    summary: 'Get Document',
    value: {
      id: 'doc1',
      title: 'Document 1',
      ownerId: '1',
      createdAt: '2025-04-27T17:50:00.000Z',
      fileUrl: '/uploads/doc1.pdf',
    },
  },
};

export const createDocumentRequestExample = {
  document: {
    summary: 'Create Document',
    value: {
      title: 'Document 1',
      file: 'file.pdf',
    },
  },
};

export const createDocumentResponseExample = {
  document: {
    summary: 'Document Created',
    value: {
      id: 'doc1',
      title: 'Document 1',
      ownerId: '1',
      createdAt: '2025-04-27T17:50:00.000Z',
      fileUrl: '/uploads/doc1.pdf',
    },
  },
};

export const updateDocumentRequestExample = {
  document: {
    summary: 'Update Document',
    value: {
      title: 'Updated Title',
    },
  },
};

export const updateDocumentResponseExample = {
  document: {
    summary: 'Document Updated',
    value: {
      id: 'doc1',
      title: 'Updated Title',
      ownerId: '1',
      createdAt: '2025-04-27T17:50:00.000Z',
      fileUrl: '/uploads/doc1.pdf',
    },
  },
};

export const deleteDocumentResponseExample = {
  document: {
    summary: 'Document Deleted',
    value: {
      message: 'Document deleted successfully',
    },
  },
};
