import './utils/moduleAlias';

import { Logger } from 'euberlog';
import * as minimist from 'minimist';

import { Database } from '@/utils/database';
import { Bot } from '@/utils/bot';
import OPTIONS from '@/options';

const args = minimist(process.argv.slice(2));
const logger = new Logger({
    scope: 'broadcastMessage'
});

async function executeTask(message: string): Promise<void> {
    let database: Database | null = null;
    let bot: Bot | null = null;

    try {
        logger.info('Starting...');

        database = new Database({
            url: OPTIONS.redis.url
        });
        await database.open();
        logger.debug('Database instance created');

        bot = new Bot(OPTIONS.telegram.botToken, database);
        await bot.sendMessageToEveryone(message);

        logger.success('The message has been sent to all users');
    } catch (error: any) {
        logger.error(error);
    } finally {
        if (database !== null) {
            await database.close();
        }
        if (bot !== null) {
            bot.close();
        }
    }
}

(async function () {
    try {
        if (args.help) {
            console.log(`
Usage: npm run scripts:broadcast-message -- [--help] [--message <string>]
Sends the given message to all users.
If the parameter --help is passed, the help is printed.
The parameter --message is required and consists in the message text, parsed as HTML
            `);
        } else {
            const message: string | undefined = args.message;
            if (!message) {
                throw new Error(
                    'The message is missing. Please pass the --message parameter. Pass --help for more information.'
                );
            }
            await executeTask(message);
        }
    } catch (error: any) {
        logger.error(error);
    }
})();
