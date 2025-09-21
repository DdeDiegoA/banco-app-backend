import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Account } from '../accounts/entities/account.entity';
import { LedgerEntry, EntryType } from './entities/ledger-entry.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @InjectRepository(LedgerEntry)
    private ledgerRepo: Repository<LedgerEntry>,
  ) {}

  /**
   * Transfer amount (decimal) between accounts.
   * We use a DB transaction to ensure atomicity.
   */
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amountDecimal: number,
  ) {
    if (fromAccountId === toAccountId)
      throw new Error('Cannot transfer to same account');
    const amountCents = Math.round(amountDecimal * 100);

    return this.dataSource.transaction(async (manager) => {
      // lock rows (production: use SELECT ... FOR UPDATE)
      const from = await manager.findOne(Account, {
        where: { id: fromAccountId },
      });
      const to = await manager.findOne(Account, { where: { id: toAccountId } });

      if (!from || !to) throw new Error('Account not found');

      // check funds
      if (BigInt(from.balanceCents) < BigInt(amountCents))
        throw new Error('Insufficient funds');

      // create transaction entity
      const tx = manager.create(Transaction, {
        fromAccount: from,
        toAccount: to,
        amountCents: amountCents.toString(),
        status: TransactionStatus.PENDING,
      });

      // debit / credit balances
      from.debitCents(amountCents);
      to.creditCents(amountCents);

      // create ledger entries (double-entry)
      const debitEntry = manager.create(LedgerEntry, {
        transaction: tx,
        account: from,
        type: EntryType.DEBIT,
        amountCents: amountCents.toString(),
      });
      const creditEntry = manager.create(LedgerEntry, {
        transaction: tx,
        account: to,
        type: EntryType.CREDIT,
        amountCents: amountCents.toString(),
      });

      tx.ledgerEntries = [debitEntry, creditEntry];
      tx.status = TransactionStatus.COMPLETED;

      // persist: save accounts (manager.save will do insert/update)
      await manager.save(from);
      await manager.save(to);
      const savedTx = await manager.save(tx);
      // ledger entries saved via cascade, but ensure persistent
      return savedTx;
    });
  }
}
