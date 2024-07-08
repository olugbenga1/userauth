import { IsString } from 'class-validator';

export class AddUserToOrgDto {
  @IsString()
  userId: string;
}
