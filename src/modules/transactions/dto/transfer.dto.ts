import { IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferDto {
  @IsString()
  fromAccountNumber: string;

  @IsString()
  toAccountNumber: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number; // en decimal (ej. 12.50) — convertiremos a cents
}
