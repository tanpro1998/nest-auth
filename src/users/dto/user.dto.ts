/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UserDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @MaxLength(40)
  @IsNotEmpty()
  readonly address: string;
}
