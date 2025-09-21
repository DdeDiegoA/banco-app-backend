import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, AccountType } from './entities/account.entity';
import { Client } from '../users/entities/client.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
  ) {}

  async createAccount(clientId: string, type: AccountType): Promise<Account> {
    const client = await this.clientsRepo.findOne({ where: { id: clientId } });
    if (!client) throw new Error('Client not found');

    const account = this.accountsRepo.create({
      accountNumber:
        'ACCT-' +
        Math.floor(Math.random() * 1e9)
          .toString()
          .padStart(9, '0'),
      client,
      type,
      balanceCents: '0',
    });
    return this.accountsRepo.save(account);
  }

  async getBalance(accountId: string): Promise<number> {
    const account = await this.accountsRepo.findOne({
      where: { id: accountId },
    });
    if (!account) throw new Error('Account not found');
    return Number(account.balanceCents) / 100;
  }
}
