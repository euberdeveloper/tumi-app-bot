import './utils/moduleAlias';

import { Logger } from 'euberlog';
import * as minimist from 'minimist';

import { Database } from '@/utils/database';
import OPTIONS from '@/options';

const args = minimist(process.argv.slice(2));
const logger = new Logger({
    scope: 'removeEvents'
});

async function executeTask(): Promise<void> {
    let database: Database | null = null;

    try {
        logger.info('Starting...');

        database = new Database({
            url: OPTIONS.redis.url
        });
        await database.open();
        logger.debug('Database instance created');

        await database.resetEvents();
        logger.success('The events have been removed');
    } catch (error: any) {
        logger.error(error);
    } finally {
        if (database !== null) {
            await database.close();
        }
    }
}

(async function () {
    try {
        if (args.help) {
            console.log(`
Usage: npm run scripts:remove-events -- [--help]
Removes the events in the database.
If the parameter --help is passed, the help is printed.
            `);
        } else {
            await executeTask();
        }
    } catch (error: any) {
        logger.error(error);
    }
})();
