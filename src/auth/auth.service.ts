import { sign, verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import RefreshToken from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private refreshTokens: RefreshToken[] = [];

  constructor(private readonly userService: UsersService) {}

  async refresh(refreshStr: string): Promise<string | undefined> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);
    if (!refreshToken) {
      return undefined;
    }
    const user = await this.userService.findOne(refreshToken.userId);
    if (!user) {
      return undefined;
    }

    const accessToken = {
      userId: refreshToken.userId,
    };

    return sign(accessToken, process.env.ACCESS_SECRET, { expiresIn: '1h' });
  }

  private retrieveRefreshToken(
    refreshStr: string,
  ): Promise<RefreshToken | undefined> {
    try {
      const decoded = verify(refreshStr, process.env.REFRESH_SECRET);
      if (typeof decoded === 'string') {
        return undefined;
      }
      return Promise.resolve(
        this.refreshTokens.find((token) => token.id === decoded.id),
      );
    } catch (err) {
      return undefined;
    }
  }

  async login(
    email: string,
    password: string,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return undefined;
    }
    if (user.password !== password) {
      return undefined;
    }

    return this.newRefreshAndAccessToken(user, values);
  }

  private async newRefreshAndAccessToken(
    user: IUser,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshObject = new RefreshToken({
      id:
        this.refreshTokens.length === 0
          ? 0
          : this.refreshTokens[this.refreshTokens.length - 1].id + 1,
      ...values,
      userId: user.id,
    });
    this.refreshTokens.push(refreshObject);

    return {
      refreshToken: refreshObject.sign(),
      accessToken: sign(
        {
          userId: user.id,
        },
        process.env.ACCESS_SECRET,
        { expiresIn: '1h' },
      ),
    };
  }

  async logout(refreshStr): Promise<void> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);
    if (!refreshToken) {
      return;
    }
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.id !== refreshToken.id,
    );
  }
}
