import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { BcryptService } from '../auth/bcrypt.service';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LedgerEntry } from '../transactions/entities/ledger-entry.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: Repository<LedgerEntry>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      createClientDto.passwordHash = await this.bcryptService.hashPassword(
        createClientDto.passwordHash,
      );
      const client = this.clientRepository.create(createClientDto);
      return await this.clientRepository.save(client);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      return await this.clientRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<Client> {
    try {
      const client = await this.clientRepository.findOne({
        where: { id },
        relations: ['accounts'],
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          accounts: {
            id: true,
            accountNumber: true,
            type: true,
            balanceCents: true,
          },
        },
      });
      if (!client) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }
      return client;
    } catch (error) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        throw new HttpException(
          {
            status,
            error: error.message,
          },
          status,
          { cause: error },
        );
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const client = await this.findOne(id);
      if (!client) {
        throw new NotFoundException(`User with id "${id}" not found`);
      }
      this.clientRepository.merge(client, updateClientDto);
      return await this.clientRepository.save(client);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.clientRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Client with id "${id}" not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 🔹 Obtiene el perfil del cliente autenticado
   * Incluye cuentas, transacciones y movimientos
   */
  async getClientProfile(username: string) {
    try {
      // 1️⃣ Buscar al cliente por username
      const client = await this.clientRepository.findOne({
        where: { username },
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // 2️⃣ Obtener las cuentas asociadas
      const accounts =
        (await this.accountRepository.find({
          where: { client: { id: client.id } },
        })) ?? [];

      const accountIds = accounts.map((acc) => acc.id);

      // 3️⃣ Obtener transacciones del cliente
      const transactions =
        accountIds.length > 0
          ? await this.transactionRepository.find({
              where: [
                { fromAccount: { id: In(accountIds) } },
                { toAccount: { id: In(accountIds) } },
              ],
              relations: ['fromAccount', 'toAccount', 'ledgerEntries'],
            })
          : [];

      // 4️⃣ Obtener movimientos (ledger entries)
      const ledgerEntries =
        accountIds.length > 0
          ? await this.ledgerRepository
              .createQueryBuilder('ledger')
              .leftJoinAndSelect('ledger.account', 'account')
              .leftJoinAndSelect('ledger.transaction', 'transaction')
              .leftJoinAndSelect('transaction.fromAccount', 'fromAccount')
              .leftJoinAndSelect('transaction.toAccount', 'toAccount')
              // filtramos por las cuentas asociadas al cliente (account.id IN accountIds)
              .where('ledger.accountId IN (:...accountIds)', { accountIds })
              .orderBy('ledger.createdAt', 'DESC')
              .getMany()
          : [];

      // 5️⃣ Armar respuesta limpia y consistente
      return {
        client: {
          id: client.id ?? null,
          name: client.name ?? '',
          email: client.email ?? '',
          address: client.address ?? '',
          phone: client.phone ?? '',
        },
        accounts:
          accounts.length > 0
            ? accounts.map((acc) => ({
                id: acc.id ?? null,
                type: acc.type ?? '',
                balanceCents:
                  acc.balanceCents !== undefined ? acc.balanceCents : 0,
                accountNumber: acc.accountNumber ?? '',
              }))
            : [],
        transactions:
          transactions.length > 0
            ? transactions.map((t) => ({
                id: t.id ?? null,
                amountCents: t.amountCents ?? 0,
                status: t.status ?? '',
                fromAccount: {
                  accountNumber: t.fromAccount.accountNumber,
                  type: t.fromAccount.type,
                },
                toAccount: {
                  accountNumber: t.toAccount.accountNumber,
                  type: t.toAccount.type,
                },
                createdAt: t.createdAt ?? null,
              }))
            : [],
        ledgerEntries:
          ledgerEntries.length > 0
            ? ledgerEntries.map((l) => ({
                id: l.id ?? null,
                type: l.type ?? '',
                amountCents: l.amountCents ?? '0',
                createdAt: l.createdAt ?? null,
                transaction: {
                  fromAccount: {
                    accountNumber: l.transaction.fromAccount.accountNumber,
                  },
                  toAccount: {
                    accountNumber: l.transaction.toAccount.accountNumber,
                  },
                  status: l.transaction.status,
                },
              }))
            : [],
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 🔹 Obtiene los detalles completos del cliente (por ID)
   */
  async getClientDetails(clientId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: [
        'accounts',
        'accounts.transactions',
        'accounts.transactions.ledgerEntries',
      ],
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    return client;
  }
}
