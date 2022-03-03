import './utils/moduleAlias';

import { Logger } from 'euberlog';
import * as fs from 'fs';
import * as minimist from 'minimist';

import { Database } from '@/utils/database';
import OPTIONS from '@/options';

const args = minimist(process.argv.slice(2));
const logger = new Logger({
    scope: 'importChats'
});

async function executeTask(inputPath: string): Promise<void> {
    let database: Database | null = null;

    try {
        logger.info('Starting...');

        database = new Database({
            url: OPTIONS.redis.url
        });
        await database.open();
        logger.debug('Database instance created');

        const chats: number[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        logger.debug(`${chats.length} chats found`);

        if (!Array.isArray(chats) || chats.some(chat => typeof chat !== 'number')) {
            throw new Error('The input file is not valid: it should be an array of numbers');
        }

        await database.importChats(chats);
        logger.success('The chats have been imported');
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
Usage: npm run scripts:import-chats -- [--help] [--in <path>]
Imports the chats from the json file passed as --in parameter.
If the parameter --help is passed, the help is printed.
            `);
        } else {
            const inputPath: string | undefined = args.in;

            if (!inputPath) {
                throw new Error('The parameter --in is required');
            }

            await executeTask(inputPath);
        }
    } catch (error: any) {
        logger.error(error);
    }
})();
