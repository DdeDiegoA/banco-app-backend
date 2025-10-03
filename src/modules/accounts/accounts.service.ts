import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, AccountType } from './entities/account.entity';
import { Client } from '../users/entities/client.entity';
import { User } from '../users/entities/user.entity';

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

  async createAccount(clientId: string, type: AccountType): Promise<Account> {
    const client = await this.userRepo.findOne({ where: { id: clientId } });
    console.log(client);
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

  async transferFunds(
    fromId: string,
    toId: string,
    amountCents: number,
  ): Promise<void> {
    if (fromId === toId)
      throw new Error('No se puede transferir a la misma cuenta');

    const fromAccount = await this.accountsRepo.findOne({
      where: { id: fromId },
    });
    const toAccount = await this.accountsRepo.findOne({ where: { id: toId } });

    if (!fromAccount || !toAccount)
      throw new Error('Cuenta origen o destino no encontrada');

    fromAccount.debitCents(amountCents);
    toAccount.creditCents(amountCents);

    await this.accountsRepo.manager.transaction(async (manager) => {
      await manager.save(fromAccount);
      await manager.save(toAccount);
    });

    // Opcional: registrar transacción si tienes entidad `Transaction`
  }
}
