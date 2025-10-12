import { IsString, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  fromAccountNumber: string;

  @IsString()
  toAccountNumber: string;

  @IsNumber()
  @Min(0)
  amountCents: number;
}
