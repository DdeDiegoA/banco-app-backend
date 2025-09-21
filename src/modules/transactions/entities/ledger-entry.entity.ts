import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction, (t) => t.ledgerEntries, { onDelete: 'CASCADE' })
  transaction: Transaction;

  @ManyToOne(() => Account, (a) => a.ledgerEntries, { eager: true })
  account: Account;

  @Column({ type: 'enum', enum: EntryType })
  type: EntryType;

  @Column({ type: 'bigint' })
  amountCents: string;

  @CreateDateColumn()
  createdAt: Date;
}
