import { IsUUID, IsInt, Min } from 'class-validator';

export class TransferDto {
  @IsUUID()
  fromAccountId: string;

  @IsUUID()
  toAccountId: string;

  @IsInt()
  @Min(1)
  amountCents: number;
}
