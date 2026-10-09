import { OAuth2Client } from 'google-auth-library';

export interface GoogleIdentity {
  email: string;
  emailVerified: boolean;
  name?: string;
}

// Turns a Google ID token into the identity it proves; throws when the token is not valid
export interface GoogleIdentityVerifier {
  verify(idToken: string): Promise<GoogleIdentity>;
}

// Checks signature, expiry and audience (our client id) against Google's public keys
export class GoogleAuthVerifier implements GoogleIdentityVerifier {
  private readonly client = new OAuth2Client();

  constructor(private readonly clientId: string) {}

  async verify(idToken: string): Promise<GoogleIdentity> {
    const ticket = await this.client.verifyIdToken({ idToken, audience: this.clientId });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('Google token has no email');
    return { email: payload.email, emailVerified: payload.email_verified === true, name: payload.name };
  }
}
