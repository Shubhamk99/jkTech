import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import {
  triggerIngestionRequestExample,
  triggerIngestionResponseExample,
  ingestionStatusResponseExample,
  embeddingsResponseExample,
  listIngestionsResponseExample,
} from '../swagger-examples/ingestion.examples';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('ingestion')
@ApiBearerAuth('access-token')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'editor')
  @Permissions('ingestion:trigger')
  @ApiBody({
    description: 'Trigger ingestion for a document',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
      },
      required: ['documentId'],
    },
    examples: triggerIngestionRequestExample,
  })
  @ApiResponse({
    status: 201,
    description: 'Ingestion triggered.',
    content: {
      'application/json': {
        examples: triggerIngestionResponseExample,
      },
    },
  })
  trigger(@Body() dto: TriggerIngestionDto) {
    return this.ingestionService.trigger(dto.documentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ingestion:status')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Get ingestion status by ID.',
    content: {
      'application/json': {
        examples: ingestionStatusResponseExample,
      },
    },
  })
  status(@Param('id') id: string) {
    return this.ingestionService.status(id);
  }

  @Get(':id/embeddings')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ingestion:embeddings')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Get document embeddings by ID.',
    content: {
      'application/json': {
        examples: embeddingsResponseExample,
      },
    },
  })
  async getEmbeddings(@Param('id') id: string) {
    return this.ingestionService.getEmbeddings(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ingestion:list')
  @ApiResponse({
    status: 200,
    description: 'List all ingestions.',
    content: {
      'application/json': {
        examples: listIngestionsResponseExample,
      },
    },
  })
  list() {
    return this.ingestionService.list();
  }
}
