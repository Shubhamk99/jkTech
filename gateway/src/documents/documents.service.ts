import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as Multer from 'multer';

/**
 * Service for managing documents in the gateway.
 * Handles document creation, retrieval, updating, and deletion.
 */
@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  /**
   * Retrieves all documents.
   * @returns A promise resolving to an array of documents.
   */
  async findAll() {
    return this.documentsRepository.find();
  }

  /**
   * Retrieves a document by its ID.
   * @param id The document ID.
   * @returns A promise resolving to the document or throws if not found.
   */
  async findOne(id: string) {
    const doc = await this.documentsRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  /**
   * Creates a new document entry.
   * @param dto The DTO containing document details.
   * @param file The uploaded file object.
   * @param ownerId The ID of the document owner.
   * @returns A promise resolving to the created document.
   */
  async create(dto: CreateDocumentDto, file: Multer.File, ownerId: string) {
    if (!file) throw new NotFoundException('File is required');
    // Defensive: ensure file.path is a string and not error-typed
    let filePath = '';
    if (
      file &&
      typeof file === 'object' &&
      'path' in file &&
      typeof (file as Record<string, unknown>).path === 'string'
    ) {
      filePath = String((file as Record<string, unknown>).path);
    }
    if (!filePath) {
      throw new NotFoundException('File path is missing or invalid');
    }
    const doc = this.documentsRepository.create({
      title: dto.title,
      description: dto.description,
      filePath,
      owner: { id: ownerId },
    });
    await this.documentsRepository.save(doc);
    return doc;
  }

  /**
   * Updates a document by its ID.
   * @param id The document ID.
   * @param dto The DTO containing updated document details.
   * @returns A promise resolving to the updated document.
   */
  async update(id: string, dto: UpdateDocumentDto) {
    const doc = await this.documentsRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    Object.assign(doc, dto);
    await this.documentsRepository.save(doc);
    return doc;
  }

  /**
   * Removes a document by its ID.
   * @param id The document ID.
   * @returns A promise resolving to a message on successful deletion.
   */
  async remove(id: string) {
    const doc = await this.documentsRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.documentsRepository.remove(doc);
    return { message: 'Document deleted' };
  }
}
