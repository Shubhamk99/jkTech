import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IngestionService } from './ingestion.service';

@Controller()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  // Simulate document ingestion
  @MessagePattern('ingest')
  ingestDocument(@Payload() data: { document: string; id?: string }) {
    return this.ingestionService.ingestDocument(data.document, data.id);
  }

  // Simulate status check
  @MessagePattern('status')
  getIngestionStatus(@Payload() data: { id: string }) {
    return this.ingestionService.getIngestionStatus(data.id);
  }

  // Simulate embedding retrieval
  @MessagePattern('embeddings')
  getEmbeddings(@Payload() data: { id: string }) {
    return this.ingestionService.getEmbeddings(data.id);
  }
}
