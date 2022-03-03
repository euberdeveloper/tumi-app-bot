import './utils/moduleAlias';

import logger from 'euberlog';

import { Database } from '@/utils/database';
import OPTIONS from '@/options';

/**
 * Prints the events of the database.
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

        const events = await database.getEvents();
        logger.success('The events are: ', JSON.stringify(events, null, 2));
    } catch (error: any) {
        logger.error(error);
    } finally {
        if (database !== null) {
            await database.close();
        }
    }
})();
