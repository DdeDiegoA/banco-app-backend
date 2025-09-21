import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Client } from '../../users/entities/client.entity';
import { LedgerEntry } from 'src/modules/transactions/entities/ledger-entry.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accountNumber: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.CHECKING })
  type: AccountType;

  // guardamos montos en "cents" para evitar floats
  @Column({ type: 'bigint', default: 0 })
  balanceCents: string;

  @ManyToOne(() => Client, (c) => c.accounts, { nullable: false })
  client: Client;

  @OneToMany(() => Transaction, (t) => t.fromAccount)
  transactionsOrigin: Transaction[];

  @OneToMany(() => Transaction, (t) => t.toAccount)
  transactionsDestination: Transaction[];

  @OneToMany(() => LedgerEntry, (le) => le.account)
  ledgerEntries: LedgerEntry[];

  // utilidad: obtener balance en formato decimal
  getBalance(): number {
    return Number(this.balanceCents) / 100;
  }

  // operaciones de entidad (no persisten)
  debitCents(amountCents: number) {
    const current = BigInt(this.balanceCents);
    if (current < BigInt(amountCents)) throw new Error('Insufficient funds');
    this.balanceCents = (current - BigInt(amountCents)).toString();
  }
  creditCents(amountCents: number) {
    this.balanceCents = (
      BigInt(this.balanceCents) + BigInt(amountCents)
    ).toString();
  }
}
