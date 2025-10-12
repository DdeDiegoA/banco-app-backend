import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Account } from '../accounts/entities/account.entity';
import { LedgerEntry, EntryType } from './entities/ledger-entry.entity';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  /**
   * Transfer amount (decimal) between accounts.
   * We use a DB transaction to ensure atomicity.
   */
  async transfer(transferData: TransferDto): Promise<Transaction> {
    const { fromAccountNumber, toAccountNumber, amount } = transferData;

    if (fromAccountNumber === toAccountNumber)
      throw new Error('Cannot transfer to same account');
    const amountCents = Math.round(amount * 100);

    return this.dataSource.transaction(async (manager) => {
      // lock rows (production: use SELECT ... FOR UPDATE)
      const from = await manager.findOne(Account, {
        where: { accountNumber: fromAccountNumber },
      });
      const to = await manager.findOne(Account, {
        where: { accountNumber: toAccountNumber },
      });

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

      await manager.save([from, to]);

      const savedTx = await manager.save(tx);
      savedTx.status = TransactionStatus.COMPLETED;

      // create ledger entries (double-entry)
      const debitEntry = manager.create(LedgerEntry, {
        transaction: savedTx,
        account: from,
        type: EntryType.DEBIT,
        amountCents: amountCents.toString(),
      });
      const creditEntry = manager.create(LedgerEntry, {
        transaction: savedTx,
        account: to,
        type: EntryType.CREDIT,
        amountCents: amountCents.toString(),
      });
      await manager.save([debitEntry, creditEntry]);

      savedTx.ledgerEntries = [debitEntry, creditEntry];
      const finalTx = await manager.save(savedTx);
      return finalTx;
    });
  }
}
