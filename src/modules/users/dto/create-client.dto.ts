import { IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  username: string;

  @IsString()
  passwordHash: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
