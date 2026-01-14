import * as http from 'http';
import axios from 'axios';
import { AddressInfo } from 'net';

export class OAuthClient {
  private readonly CLIENT_ID = '1071006060591-googletest.apps.googleusercontent.com';
  private readonly AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
  private readonly SCOPES = ['https://www.googleapis.com/auth/cloudaicompanion'];

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: 'http://127.0.0.1:0/callback',
      response_type: 'code',
      scope: this.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return `${this.AUTH_ENDPOINT}?${params.toString()}`;
  }

  async startLocalServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code');
          if (code) {
            res.end('Authentication successful! You can close this window.');
            server.close();
            resolve(code);
          } else {
            res.end('No code found.');
            server.close();
            reject(new Error('No code found'));
          }
        }
      });
      
      server.listen(0, '127.0.0.1');
    });
  }

  async exchangeCode(code: string): Promise<any> {
    const response = await axios.post(this.TOKEN_ENDPOINT, {
      code,
      client_id: this.CLIENT_ID,
      grant_type: 'authorization_code',
      redirect_uri: 'http://127.0.0.1:0/callback'
    });
    return response.data;
  }
}
