import { OAuthClient } from '../../src/auth/OAuthClient';

describe('OAuthClient', () => {
  it('should generate correct auth URL', () => {
    const client = new OAuthClient();
    const url = client.getAuthUrl();
    expect(url).toContain('accounts.google.com');
    expect(url).toContain('cloudaicompanion');
    expect(url).toContain('1071006060591');
  });
});
