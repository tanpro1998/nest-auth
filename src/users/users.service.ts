import { RegisterDto } from './dto/register.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(RegisterDto: RegisterDto) {
    const { email } = RegisterDto;
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const createdUser = new this.userModel(RegisterDto);
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  sanitizeUser(user: User) {
    const sanitized = user.toObject();
    delete sanitized['password'];
    return sanitized;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne(
      (user: User) => user.email === email,
    );
    if (user) {
      return Promise.resolve(user);
    }
    return undefined;
  }
  public async findOne(id: string): Promise<User | undefined> {
    const user = await this.userModel.findById({ _id: id });
    if (user) {
      return Promise.resolve(user);
    }
    return undefined;
  }
}
