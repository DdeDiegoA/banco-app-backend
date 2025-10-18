import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  NotContains,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @NotContains(' ')
  @Length(4, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
