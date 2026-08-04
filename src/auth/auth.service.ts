import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException();

    return this.getTokensAndUpdateUser(user.id, user.username);
  }

  async refreshTokens(refreshToken: string) {
    let payload: { sub: number; username: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) {
      // token reusado o robado: token válido por firma pero no coincide con el vigente
      await this.usersService.updateHashedRefreshToken(payload.sub, null);
      throw new UnauthorizedException();
    }

    return this.getTokensAndUpdateUser(user.id, user.username);
  }

  async logout(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  private async getTokensAndUpdateUser(userId: number, username: string) {
    const payload = { sub: userId, username };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '15m',
    });

    // The user can use consume the api until resfresh token is expired then it needs to login again to get new access token
    // TODO: Rotate the refresh token on every use, automatically replacing the old token with a newly generated one
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );

    return { access_token, refresh_token };
  }
}
