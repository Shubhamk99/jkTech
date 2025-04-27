import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request as ExpressRequest } from 'express';
import { File as MulterFile } from 'multer';

import {
  findAllDocumentsResponseExample,
  findOneDocumentResponseExample,
  createDocumentRequestExample,
  createDocumentResponseExample,
  updateDocumentRequestExample,
  updateDocumentResponseExample,
  deleteDocumentResponseExample,
} from '../swagger-examples/documents.examples';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

type SafeUser = {
  userId: string;
  username: string;
  roles?: string[];
  userRoles?: { role: { name: string } }[];
};

@ApiTags('documents')
@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('document:read')
  @ApiResponse({
    status: 200,
    description: 'List all documents.',
    content: {
      'application/json': {
        examples: findAllDocumentsResponseExample,
      },
    },
  })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('document:read')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Get a document by ID.',
    content: {
      'application/json': {
        examples: findOneDocumentResponseExample,
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'editor')
  @Permissions('document:create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: unknown, file: unknown, cb: unknown): void => {
          let fieldname = 'file';
          let originalname = '';
          if (file && typeof file === 'object' && file !== null) {
            if (
              Object.prototype.hasOwnProperty.call(file, 'fieldname') &&
              typeof (file as Record<string, unknown>).fieldname === 'string'
            ) {
              fieldname = String((file as Record<string, unknown>).fieldname);
            }
            if (
              Object.prototype.hasOwnProperty.call(file, 'originalname') &&
              typeof (file as Record<string, unknown>).originalname === 'string'
            ) {
              originalname = String(
                (file as Record<string, unknown>).originalname,
              );
            }
          }
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          // Safer callback invocation
          if (
            typeof cb === 'function' &&
            Object.prototype.toString.call(cb) === '[object Function]'
          ) {
            (cb as (error: Error | null, filename: string) => void)(
              null,
              `${fieldname}-${uniqueSuffix}${typeof originalname === 'string' ? extname(originalname) : ''}`,
            );
          }
        },
      }),
    }),
  )
  @ApiBody({
    description: 'Create a document',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['title', 'file'],
    },
    examples: createDocumentRequestExample,
  })
  @ApiResponse({
    status: 201,
    description: 'Document created.',
    content: {
      'application/json': {
        examples: createDocumentResponseExample,
      },
    },
  })
  create(
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: MulterFile,
    @Request() req: ExpressRequest & { user?: SafeUser },
  ) {
    const user = req.user;
    if (!user || typeof user.userId !== 'string') {
      throw new Error('Invalid user object in request');
    }
    return this.documentsService.create(dto, file, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'editor')
  @Permissions('document:update')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Update a document',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
      required: ['title'],
    },
    examples: updateDocumentRequestExample,
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated.',
    content: {
      'application/json': {
        examples: updateDocumentResponseExample,
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'editor')
  @Permissions('document:delete')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Document deleted.',
    content: {
      'application/json': {
        examples: deleteDocumentResponseExample,
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
