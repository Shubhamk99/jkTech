import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingestion } from './entities/ingestion.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

/**
 * Service for handling ingestion processes in the gateway.
 * Responsible for triggering, tracking, and retrieving ingestion and embedding data.
 */
@Injectable()
export class IngestionService implements OnModuleInit {
  private client: ClientProxy;

  constructor(
    @InjectRepository(Ingestion)
    private ingestionRepository: Repository<Ingestion>,
  ) {}

  /**
   * Initializes the microservice client connection.
   */
  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.INGESTION_URL,
        port: 4001,
      },
    });
  }

  /**
   * Triggers an ingestion process for a document.
   * @param documentId The document ID to ingest.
   * @returns An object containing the ingestion ID and its status.
   */
  async trigger(documentId: string) {
    // Save ingestion record
    const ingestion = this.ingestionRepository.create({
      status: 'pending',
      documentId,
    });
    await this.ingestionRepository.save(ingestion);
    // Call mock-ingestion microservice, passing the gateway's ingestionId
    try {
      const response = await this.client.send<any, { document: string; id: string }>('ingest', { document: documentId, id: ingestion.id }).toPromise();
      if (response && response.status === 'processing') {
        ingestion.status = 'processing';
        await this.ingestionRepository.save(ingestion);
      } else {
        ingestion.status = 'failed';
        await this.ingestionRepository.save(ingestion);
        throw new InternalServerErrorException(
          'Mock ingestion did not return processing status',
        );
      }
    } catch (err) {
      ingestion.status = 'failed';
      await this.ingestionRepository.save(ingestion);
      throw new InternalServerErrorException(
        'Failed to trigger ingestion process',
      );
    }
    return { ingestionId: ingestion.id, status: ingestion.status };
  }

  /**
   * Retrieves the status of a specific ingestion.
   * @param id The ingestion ID.
   * @returns An object containing the ingestion status.
   */
  async status(id: string) {
    // Query the mock-ingestion microservice for status
    try {
      const response = await this.client.send<any, { id: string }>('status', { id }).toPromise();
      if (response && response.status) {
        return { id, status: response.status };
      }
      throw new NotFoundException('Ingestion not found');
    } catch {
      throw new NotFoundException('Ingestion not found');
    }
  }

  /**
   * Retrieves a list of all ingestions.
   * @returns A promise resolving to an array of ingestions.
   */
  async list() {
    return this.ingestionRepository.find();
  }

  /**
   * Retrieves embeddings for a specific ingestion.
   * @param id The ingestion ID.
   * @returns An object containing the embeddings or throws if not found.
   */
  async getEmbeddings(id: string) {
    try {
      const response = await this.client.send<any, { id: string }>('embeddings', { id }).toPromise();
      if (response && response.embeddings) {
        return response;
      }
      throw new NotFoundException('Embeddings not found');
    } catch {
      throw new NotFoundException('Embeddings not found');
    }
  }
}
