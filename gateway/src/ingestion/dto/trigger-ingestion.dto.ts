import { IsNotEmpty } from 'class-validator';

export class TriggerIngestionDto {
  @IsNotEmpty()
  documentId: string;
}
