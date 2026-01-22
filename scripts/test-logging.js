import { getLogger } from '../dist/utils/logger.js';
import fs from 'fs';

console.log('=== Testing Autopilot Logging System ===\n');

const logger = getLogger();
const logFilePath = logger.getLogFilePath();

console.log(`Log file location: ${logFilePath}\n`);
console.log('Testing logger methods...\n');

logger.info('Test', 'Testing info level logging', { 
  threshold: 0.02, 
  message: 'This is a test log entry' 
});

logger.debug('Test', 'Testing debug level logging', {
  quota: 0.05,
  percentage: '5%'
});

logger.warn('Test', 'Testing warn level logging', {
  model: 'gemini-3-pro',
  warning: 'Quota below threshold'
});

logger.error('Test', 'Testing error level logging', {
  error: 'Simulated error',
  stack: 'test stack trace'
});

setTimeout(() => {
  console.log('\n=== Log File Check ===\n');
  
  if (fs.existsSync(logFilePath)) {
    console.log('✓ Log file created successfully!\n');
    console.log('=== Log Contents ===\n');
    const logContents = fs.readFileSync(logFilePath, 'utf-8');
    console.log(logContents);
    console.log('\n=== End of Logs ===\n');
    
    console.log('✓ Logging system is working correctly!\n');
    console.log('Configuration:');
    console.log('- Log File: ' + logFilePath);
    console.log('- Log Rotation: 7 days');
    console.log('- Format: [timestamp] [level] [component] message | data');
    console.log('\nWhen testing autopilot with 98% threshold (2% remaining):');
    console.log('  tail -f ' + logFilePath);
  } else {
    console.log('❌ Log file was not created at: ' + logFilePath);
  }
}, 100);
