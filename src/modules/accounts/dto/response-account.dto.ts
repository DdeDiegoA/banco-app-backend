import { AccountType } from '../entities/account.entity';

export class ResponseAccountDto {
  id: string;
  accountNumber: string;
  type: AccountType;
  balanceCents: string;
  clientId: string;
}
