import { spawn } from 'child_process';
import * as readline from 'readline';

export class LSPFinder {
  findProcess(): Promise<{ pid: number, csrfToken: string, port: number } | null> {
    return new Promise((resolve) => {
      const ps = spawn('ps', ['aux']);
      const rl = readline.createInterface({
        input: ps.stdout,
        crlfDelay: Infinity,
      });

      let found = false;

      rl.on('line', (line) => {
        if (found) return;

        if (line.includes('language_server_antigravity')) {
          const pidMatch = line.trim().split(/\s+/)[1];
          const csrfMatch = line.match(/--csrf_token=([a-zA-Z0-9_\-]+)/);
          const portMatch = line.match(/--extension_server_port=(\d+)/);

          if (pidMatch && csrfMatch && portMatch) {
            found = true;
            resolve({
              pid: parseInt(pidMatch, 10),
              csrfToken: csrfMatch[1],
              port: parseInt(portMatch[1], 10),
            });
            ps.kill();
          }
        }
      });

      ps.on('close', () => {
        if (!found) {
          resolve(null);
        }
      });
    });
  }
}
