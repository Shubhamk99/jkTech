import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentsRepository: any;

  beforeEach(async () => {
    documentsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: documentsRepository },
      ],
    }).compile();
    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      documentsRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll();
      expect(documentsRepository.find).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('findOne', () => {
    it('should return document by id', async () => {
      documentsRepository.findOne.mockResolvedValue({ id: 'abc' });
      const result = await service.findOne('abc');
      expect(documentsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'abc' } });
      expect(result).toEqual({ id: 'abc' });
    });
    it('should throw NotFoundException if not found', async () => {
      documentsRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = { title: 't', description: 'd' };
    const file = { path: '/tmp/file.pdf' } as any;
    it('should throw if file is missing', async () => {
      await expect(service.create(dto, undefined as any, 'owner')).rejects.toThrow(NotFoundException);
    });
    it('should throw if file path is missing', async () => {
      await expect(service.create(dto, {} as any, 'owner')).rejects.toThrow(NotFoundException);
    });
    it('should create and save document if valid', async () => {
      documentsRepository.create.mockReturnValue({ id: 'docid' });
      documentsRepository.save.mockResolvedValue({ id: 'docid' });
      const result = await service.create(dto, file, 'owner');
      expect(documentsRepository.create).toHaveBeenCalledWith({
        title: 't',
        description: 'd',
        filePath: '/tmp/file.pdf',
        owner: { id: 'owner' },
      });
      expect(documentsRepository.save).toHaveBeenCalledWith({ id: 'docid' });
      expect(result).toEqual({ id: 'docid' });
    });
  });

  describe('update', () => {
    it('should throw if document not found', async () => {
      documentsRepository.findOne.mockResolvedValue(null);
      await expect(service.update('id', { title: 'new' })).rejects.toThrow(NotFoundException);
    });
    it('should update and save document if found', async () => {
      const doc = { id: 'id', title: 'old', description: 'old' };
      documentsRepository.findOne.mockResolvedValue(doc);
      documentsRepository.save.mockResolvedValue({ ...doc, title: 'new' });
      const result = await service.update('id', { title: 'new' });
      expect(documentsRepository.save).toHaveBeenCalledWith({ id: 'id', title: 'new', description: 'old' });
      expect(result).toEqual({ id: 'id', title: 'new', description: 'old' });
    });
  });

  describe('remove', () => {
    it('should throw if document not found', async () => {
      documentsRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('id')).rejects.toThrow(NotFoundException);
    });
    it('should remove document and return message', async () => {
      const doc = { id: 'id' };
      documentsRepository.findOne.mockResolvedValue(doc);
      documentsRepository.remove.mockResolvedValue({});
      const result = await service.remove('id');
      expect(documentsRepository.remove).toHaveBeenCalledWith(doc);
      expect(result).toEqual({ message: 'Document deleted' });
    });
  });
});
