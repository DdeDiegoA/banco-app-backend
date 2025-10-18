import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { BcryptService } from '../auth/bcrypt.service';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LedgerEntry } from '../transactions/entities/ledger-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Account, Transaction, LedgerEntry]),
  ],
  controllers: [UsersController, ClientsController],
  providers: [UsersService, ClientsService, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
