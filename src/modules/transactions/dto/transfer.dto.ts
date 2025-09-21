import { IsUUID, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsUUID()
  fromAccountId: string;

  @IsUUID()
  toAccountId: string;

  @IsNumber()
  @Min(0.01)
  amount: number; // en decimal (ej. 12.50) — convertiremos a cents
}
