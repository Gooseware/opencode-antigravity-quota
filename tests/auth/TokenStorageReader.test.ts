import { TokenStorageReader } from '../../src/auth/TokenStorageReader';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('TokenStorageReader', () => {
  const mockV3Data = {
    version: 3,
    accounts: [
      { refreshToken: 'rt1', email: 'test1@gmail.com' },
      { refreshToken: 'rt2', email: 'test2@gmail.com' }
    ],
    activeIndex: 0
  };

  it('should load and parse V3 accounts', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockV3Data));
    
    const reader = new TokenStorageReader();
    const accounts = reader.getAccounts();
    
    expect(accounts).toHaveLength(2);
    expect(accounts[0].refreshToken).toBe('rt1');
    expect(reader.getActiveIndex()).toBe(0);
  });

  it('should return empty list if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    const reader = new TokenStorageReader();
    const accounts = reader.getAccounts();
    
    expect(accounts).toHaveLength(0);
    expect(reader.getActiveIndex()).toBe(-1);
  });

  it('should return empty list if version is not 3', () => {
    const invalidVersionData = { ...mockV3Data, version: 2 };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(invalidVersionData));
    
    const reader = new TokenStorageReader();
    const accounts = reader.getAccounts();
    
    expect(accounts).toHaveLength(0);
  });

  it('should return empty list if JSON is invalid', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('invalid-json');
    
    const reader = new TokenStorageReader();
    const accounts = reader.getAccounts();
    
    expect(accounts).toHaveLength(0);
  });
});
