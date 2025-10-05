import { IsString, Length, NotContains } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @NotContains(' ')
  @Length(4, 20)
  username: string;

  @IsString()
  passwordHash: string;

  role?: UserRole;
}
