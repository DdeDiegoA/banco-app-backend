import { IsEnum, IsUUID } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsUUID()
  clientId: string;

  @IsEnum(AccountType)
  type: AccountType;
}
