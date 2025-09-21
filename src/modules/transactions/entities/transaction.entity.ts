import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { LedgerEntry } from './ledger-entry.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (a) => a.transactionsOrigin, { eager: true })
  fromAccount: Account;

  @ManyToOne(() => Account, (a) => a.transactionsDestination, { eager: true })
  toAccount: Account;

  // cents
  @Column({ type: 'bigint' })
  amountCents: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @OneToMany(() => LedgerEntry, (le) => le.transaction, { cascade: true })
  ledgerEntries: LedgerEntry[];

  @CreateDateColumn()
  createdAt: Date;
}
