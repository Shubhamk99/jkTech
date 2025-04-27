import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from '../ingestion.controller';
import { IngestionService } from '../ingestion.service';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [IngestionService],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  describe('ingestDocument', () => {
    it('should delegate to service and return processing', () => {
      const spy = jest.spyOn(service, 'ingestDocument').mockReturnValue({ id: 'test-id', status: 'processing' });
      const result = controller.ingestDocument({ document: 'doc-1', id: 'test-id' });
      expect(spy).toHaveBeenCalledWith('doc-1', 'test-id');
      expect(result).toEqual({ id: 'test-id', status: 'processing' });
    });
  });

  describe('getIngestionStatus', () => {
    it('should delegate to service and return status', () => {
      const spy = jest.spyOn(service, 'getIngestionStatus').mockReturnValue({ id: 'test-id', status: 'processing' });
      const result = controller.getIngestionStatus({ id: 'test-id' });
      expect(spy).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ id: 'test-id', status: 'processing' });
    });
  });

  describe('getEmbeddings', () => {
    it('should delegate to service and return embeddings', () => {
      const spy = jest.spyOn(service, 'getEmbeddings').mockReturnValue({ id: 'test-id', embeddings: [1, 2, 3] });
      const result = controller.getEmbeddings({ id: 'test-id' });
      expect(spy).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ id: 'test-id', embeddings: [1, 2, 3] });
    });
  });
});
