
import { AccountRotator } from './auth/AccountRotator';
import { AccountMetadataV3 } from './auth/TokenStorageReader';
import { getLogger } from './utils/logger';

const logger = getLogger();
const accounts: AccountMetadataV3[] = [{
    refreshToken: 'test',
    email: 'test@example.com',
    addedAt: Date.now(),
    lastUsed: 0,
}];

try {
    const rotator = new AccountRotator(accounts, 0, { gemini: 0 });
    logger.info('Repro', 'AccountRotator instantiated successfully');
    logger.info('Repro', `Current account: ${rotator.getCurrentAccount()?.email}`);
} catch (e) {
    logger.error('Repro', 'Error instantiating AccountRotator', e);
}
