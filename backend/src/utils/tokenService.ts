import jwt, { SignOptions } from 'jsonwebtoken';

export type Role = 'admin' | 'user';

export interface TokenPayload {
  id: number;
  role: Role;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: TokenPayload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as SignOptions);
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;
    return { id: decoded.id as number, role: decoded.role as Role };
  }
}
