import { ChildEntity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Account } from 'src/modules/accounts/entities/account.entity';

@ChildEntity('client')
export class Client extends User {
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => Account, (acc) => acc.client, { cascade: true })
  accounts: Account[];
}
