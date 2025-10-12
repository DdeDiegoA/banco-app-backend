import { IsString, IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsString()
  accountNumber: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
