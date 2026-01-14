import { LSPFinder } from '../../src/quota/LSPFinder';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import * as readline from 'readline';

jest.mock('child_process');
jest.mock('readline');

describe('LSPFinder', () => {
  let mockRl: any;

  beforeEach(() => {
    mockRl = new EventEmitter();
    mockRl.close = jest.fn();
    (readline.createInterface as jest.Mock).mockReturnValue(mockRl);
  });

  it('should find antigravity process and close readline', async () => {
    const mockStdout = new PassThrough();
    const mockProcess = new EventEmitter();
    (mockProcess as any).stdout = mockStdout;
    (mockProcess as any).kill = jest.fn();
    
    (spawn as jest.Mock).mockReturnValue(mockProcess);

    const finder = new LSPFinder();
    const findPromise = finder.findProcess();
    
    // Emit line directly on mockRl
    mockRl.emit('line', 'user 1234 0.0 0.0 ... language_server_antigravity --csrf_token=xyz --extension_server_port=9999');
    mockRl.emit('line', 'user 5678 ... ignored line');
    
    const info = await findPromise;
    expect(info).toEqual({ pid: 1234, csrfToken: 'xyz', port: 9999 });
    expect(mockRl.close).toHaveBeenCalled();
    expect((mockProcess as any).kill).toHaveBeenCalled();
  });

  it('should return null if process not found', async () => {
    const mockStdout = new PassThrough();
    const mockProcess = new EventEmitter();
    (mockProcess as any).stdout = mockStdout;
    (mockProcess as any).kill = jest.fn();
    
    (spawn as jest.Mock).mockReturnValue(mockProcess);

    const finder = new LSPFinder();
    const findPromise = finder.findProcess();

    mockRl.emit('line', 'other_process');
    mockProcess.emit('close', 0);

    const info = await findPromise;
    expect(info).toBeNull();
  });

  it('should resolve with null on spawn error', async () => {
    const mockStdout = new PassThrough();
    const mockProcess = new EventEmitter();
    (mockProcess as any).stdout = mockStdout;
    (mockProcess as any).kill = jest.fn();

    (spawn as jest.Mock).mockReturnValue(mockProcess);

    const finder = new LSPFinder();
    const findPromise = finder.findProcess();

    mockProcess.emit('error', new Error('spawn failed'));

    const info = await findPromise;
    expect(info).toBeNull();
    expect(mockRl.close).toHaveBeenCalled();
  });
});
