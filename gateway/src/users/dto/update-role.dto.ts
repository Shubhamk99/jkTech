import { IsNotEmpty, IsArray } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  userId: string;

  @IsArray()
  roles: string[];
}
