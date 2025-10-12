import { IsString, IsNumber, Min } from 'class-validator';

export class DepositDto {
  @IsString()
  accountNumber: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
