import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ResponseAccountDto } from './dto/response-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

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

  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto) {
    const { accountNumber, amount } = depositDto;
    await this.accountsService.deposit(accountNumber, amount);
    return { success: true, message: 'Deposit successful' };
  }

  @Post('withdraw')
  async withdraw(@Body() withdrawDto: WithdrawDto) {
    const { accountNumber, amount } = withdrawDto;
    await this.accountsService.withdraw(accountNumber, amount);
    return { success: true, message: 'Withdrawal successful' };
  }
}
