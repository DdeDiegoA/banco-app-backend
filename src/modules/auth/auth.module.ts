import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptService } from './bcrypt.service';

@Module({
  providers: [AuthService, BcryptService],
  controllers: [AuthController],
})
export class AuthModule {}
