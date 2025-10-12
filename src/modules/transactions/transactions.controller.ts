import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  transfer(@Body() transferData: TransferDto) {
    return this.transactionsService.transfer(transferData);
  }
}
