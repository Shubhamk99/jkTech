import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from '../ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingestion } from '../entities/ingestion.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('IngestionService', () => {
  let service: IngestionService;
  let mockRepo: any;
  let mockClient: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    mockClient = {
      send: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: getRepositoryToken(Ingestion), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<IngestionService>(IngestionService);
    // Inject mock client
    (service as any).client = mockClient;
  });

  describe('trigger', () => {
    it('should create and save ingestion, update status to processing', async () => {
      const ingestionEntity = { id: 'id1', status: 'pending', documentId: 'doc1' };
      mockRepo.create.mockReturnValue(ingestionEntity);
      mockRepo.save.mockResolvedValue(ingestionEntity);
      mockClient.send.mockReturnValue({ toPromise: () => Promise.resolve({ status: 'processing' }) });
      const result = await service.trigger('doc1');
      expect(mockRepo.create).toHaveBeenCalledWith({ status: 'pending', documentId: 'doc1' });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ ingestionId: 'id1', status: 'processing' });
    });
    it('should set status to failed if microservice returns error', async () => {
      const ingestionEntity = { id: 'id2', status: 'pending', documentId: 'doc2' };
      mockRepo.create.mockReturnValue(ingestionEntity);
      mockRepo.save.mockResolvedValue(ingestionEntity);
      mockClient.send.mockReturnValue({ toPromise: () => Promise.resolve({ status: 'fail' }) });
      await expect(service.trigger('doc2')).rejects.toThrow(InternalServerErrorException);
    });
    it('should set status to failed if microservice throws', async () => {
      const ingestionEntity = { id: 'id3', status: 'pending', documentId: 'doc3' };
      mockRepo.create.mockReturnValue(ingestionEntity);
      mockRepo.save.mockResolvedValue(ingestionEntity);
      mockClient.send.mockReturnValue({ toPromise: () => Promise.reject(new Error('fail')) });
      await expect(service.trigger('doc3')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('status', () => {
    it('should return status from microservice', async () => {
      mockClient.send.mockReturnValue({ toPromise: () => Promise.resolve({ status: 'ok' }) });
      const result = await service.status('id1');
      expect(result).toEqual({ id: 'id1', status: 'ok' });
    });
    it('should throw NotFoundException if not found', async () => {
      mockClient.send.mockReturnValue({ toPromise: () => Promise.reject(new Error('not found')) });
      await expect(service.status('id2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return all ingestions', async () => {
      mockRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.list();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getEmbeddings', () => {
    it('should return embeddings if found', async () => {
      mockClient.send.mockReturnValue({ toPromise: () => Promise.resolve({ embeddings: [1, 2, 3] }) });
      const result = await service.getEmbeddings('id1');
      expect(result).toEqual({ embeddings: [1, 2, 3] });
    });
    it('should throw NotFoundException if not found', async () => {
      mockClient.send.mockReturnValue({ toPromise: () => Promise.reject(new Error('not found')) });
      await expect(service.getEmbeddings('id2')).rejects.toThrow(NotFoundException);
    });
  });
});
