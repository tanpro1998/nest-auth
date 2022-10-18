/* eslint-disable prettier/prettier */
import { Document } from 'mongoose';

export interface IUser extends Document {
  readonly username: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
}
