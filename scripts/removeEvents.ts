import './utils/moduleAlias';

import logger from 'euberlog';

import { Database } from '@/utils/database';
import OPTIONS from '@/options';

/**
 * Removes the events from the database.
 */
(async function () {
    let database: Database | null = null;

    try {
        logger.info('Starting...');

        database = new Database({
            host: OPTIONS.redis.host,
            port: OPTIONS.redis.port
        });
        logger.debug('Database instance created');

        await database.resetEvents();
        logger.success('Events reset successfully');
    } catch (error: any) {
        logger.error(error);
    } finally {
        if (database !== null) {
            await database.close();
        }
    }
})();
