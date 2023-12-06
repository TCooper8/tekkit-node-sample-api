import { UnauthorizedError } from "../errors";

export class Auth {
  constructor(
    // NOTE: The term 'subject' is referring to a JWT 'sub' field. This could be a userId, or a clientId in practice.
    private subject: string | null,
  ) { }

  /**
   * Asserts that auth is present and valid.
   * This will raise an unauthorized error if valid auth is required.
   */
  assert = () => {
    if (!this.subject) throw new UnauthorizedError('authorization-missing');
  }

  assertSubject = () => {
    if (!this.subject) throw new UnauthorizedError('subject-missing');
    return this.subject;
  }
}

export class AuthService {
  constructor() { }

  authorize = async (authorization: string | undefined): Promise<Auth> => {
    if (!authorization) return new Auth(null); // No subject or further authorization.

    // NOTE: Don't ever do this in production. This is just for demo purposes.
    return new Auth(authorization);
  }
}