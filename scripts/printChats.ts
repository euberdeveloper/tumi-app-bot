import './utils/moduleAlias';

import { Logger } from 'euberlog';
import * as minimist from 'minimist';

import { Database } from '@/utils/database';
import OPTIONS from '@/options';

const args = minimist(process.argv.slice(2));
const logger = new Logger({
    scope: 'printChats',
    debug: args.debug === true
});

async function executeTask(indentation: number): Promise<void> {
    let database: Database | null = null;

    try {
        logger.debug('Starting...');

        database = new Database({
            url: OPTIONS.redis.url
        });
        await database.open();
        logger.debug('Database instance created');

        const chats = await database.getChats();
        logger.debug('The chats are: ');

        console.log(JSON.stringify(chats, null, indentation));
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
Usage: npm run scripts:print-chats -- [--debug] [--help] [--pretty boolean|number]
Prints the chats of the database as a json in the stdout.
If the parameter --help is passed, the help is printed.
If the parameter --debug is passed, there will also be a debug log.
If the parameter --pretty is passed, the output will be pretty printed (a number specifies the indentation, which is 2 by default).
            `);
        } else {
            const indentation =
                args.pretty === undefined ? 0 : typeof args.pretty === 'number' ? args.pretty : args.pretty ? 2 : 0;
            await executeTask(indentation);
        }
    } catch (error: any) {
        logger.error(error);
    }
})();
