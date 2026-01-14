import { LSPFinder } from '../../src/quota/LSPFinder';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

jest.mock('child_process');

describe('LSPFinder', () => {
  it('should find antigravity process', async () => {
    const mockStdout = new EventEmitter();
    // @ts-ignore
    mockStdout.resume = jest.fn();
    // @ts-ignore
    mockStdout.pause = jest.fn();
    // @ts-ignore
    mockStdout.setEncoding = jest.fn();

    const mockProcess = {
      stdout: mockStdout,
      on: jest.fn(),
      kill: jest.fn()
    };
    (spawn as jest.Mock).mockReturnValue(mockProcess);

    const finder = new LSPFinder();
    const findPromise = finder.findProcess();
    
    mockStdout.emit('data', Buffer.from('user 1234 0.0 0.0 ... language_server_antigravity --csrf_token=xyz --extension_server_port=9999\n'));
    
    const info = await findPromise;
    expect(info).toEqual({ pid: 1234, csrfToken: 'xyz', port: 9999 });
  });

  it('should return null if process not found', async () => {
    const mockStdout = new EventEmitter();
    // @ts-ignore
    mockStdout.resume = jest.fn();
    // @ts-ignore
    mockStdout.pause = jest.fn();
    // @ts-ignore
    mockStdout.setEncoding = jest.fn();

    const mockProcess = {
        stdout: mockStdout,
        on: jest.fn(),
        kill: jest.fn()
    };
    (spawn as jest.Mock).mockReturnValue(mockProcess);

    const finder = new LSPFinder();
    const findPromise = finder.findProcess();

    mockStdout.emit('data', Buffer.from('other_process\n'));
    
    const closeCallback = mockProcess.on.mock.calls.find(call => call[0] === 'close')[1];
    closeCallback(0);

    const info = await findPromise;
    expect(info).toBeNull();
  });
});
