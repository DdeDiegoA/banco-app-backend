import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
//import { Account, AccountType } from './entities/account.entity';
import { Account } from './entities/account.entity';
import { Client } from '../users/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { ResponseAccountDto } from './dto/response-account.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createAccount(dto: CreateAccountDto): Promise<ResponseAccountDto> {
    const client = await this.clientsRepo.findOne({
      where: { id: dto.clientId },
    });
    if (!client) throw new Error('Client not found');

    const account = this.accountsRepo.create({
      accountNumber:
        'ACCT-' +
        Math.floor(Math.random() * 1e9)
          .toString()
          .padStart(9, '0'),
      client,
      type: dto.type,
      balanceCents: '0',
    });

    const saved = await this.accountsRepo.save(account);
    return {
      id: saved.id,
      accountNumber: saved.accountNumber,
      type: saved.type,
      balanceCents: saved.balanceCents,
      clientId: client.id,
    };
  }

  async getBalance(accountNumber: string): Promise<number> {
    const account = await this.accountsRepo.findOne({
      where: { accountNumber },
    });
    if (!account) throw new Error('Account not found');
    return Number(account.balanceCents) / 100;
  }

  async deposit(accountNumber: string, amount: number): Promise<Account> {
    const account = await this.accountsRepo.findOne({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }

    account.creditCents(Math.round(amount * 100));
    return this.accountsRepo.save(account);
  }

  async withdraw(accountNumber: string, amount: number): Promise<Account> {
    const account = await this.accountsRepo.findOne({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }

    const amountCents = Math.round(amount * 100);

    if (BigInt(account.balanceCents) < BigInt(amountCents)) {
      throw new Error('Insufficient funds');
    }

    account.debitCents(amountCents);
    return this.accountsRepo.save(account);
  }
}
