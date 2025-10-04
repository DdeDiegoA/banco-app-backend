import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TransferDto } from './dto/transfer-account.dto';
import { ResponseAccountDto } from './dto/response-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Body() dto: CreateAccountDto): Promise<ResponseAccountDto> {
    return this.accountsService.createAccount(dto);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string): Promise<{ balance: number }> {
    const balance = await this.accountsService.getBalance(id);
    return { balance };
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    await this.accountsService.transferFunds(
      dto.fromAccountId,
      dto.toAccountId,
      dto.amountCents,
    );
    return { success: true, message: 'Transferencia realizada con éxito' };
  }
}
