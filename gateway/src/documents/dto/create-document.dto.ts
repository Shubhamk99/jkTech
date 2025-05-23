import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;
}
