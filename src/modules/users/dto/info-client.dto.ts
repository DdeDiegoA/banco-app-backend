import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class InfoClientDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  address?: string;

  @IsString()
  phone?: string;

  @Type(() => InfoAccountDto)
  accounts: InfoAccountDto;
}

export class InfoAccountDto {
  @IsString()
  id: string;

  @IsString()
  accountNumber: string;

  @IsString()
  type: string;

  @IsString()
  balance: string;
}
