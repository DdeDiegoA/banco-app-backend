import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
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
      const client = await this.clientRepository.findOneBy({ id });
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
          {
            cause: error,
          },
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
}
