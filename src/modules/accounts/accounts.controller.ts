import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TransferDto } from './dto/transfer-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards()
  @Post()
  async create(@Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(dto.clientId, dto.type);
  }

  @UseGuards()
  @Get(':id/balance')
  async balance(@Param('id') id: string) {
    return { balance: await this.accountsService.getBalance(id) };
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
