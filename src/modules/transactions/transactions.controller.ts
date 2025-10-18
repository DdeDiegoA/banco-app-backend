import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface JwtUser {
  username: string;
}
interface AuthenticatedRequest {
  user: JwtUser;
}
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  transfer(@Body() transferData: TransferDto) {
    return this.transactionsService.transfer(transferData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('moves')
  moves(@Request() req: AuthenticatedRequest) {
    const username = req.user.username;
    return this.transactionsService.moves(username);
  }
}
