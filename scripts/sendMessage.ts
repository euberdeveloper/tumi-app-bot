import './utils/moduleAlias';

import { Logger } from 'euberlog';
import * as minimist from 'minimist';

import { Database } from '@/utils/database';
import { Bot } from '@/utils/bot';
import OPTIONS from '@/options';

const args = minimist(process.argv.slice(2));
const logger = new Logger({
    scope: 'sendMessage'
});

async function executeTask(message: string, chatId: number): Promise<void> {
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
        await bot.sendMessageToChat(message, chatId);

        logger.success('The message has been sent to the chat with id', chatId);
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
Usage: npm run scripts:send-message -- [--help] [--message <string>] [--chat <number>]
Sends the given message to the given chat id.
If the parameter --help is passed, the help is printed.
The parameter --message is required and consists in the message text, parsed as HTML.
The parameter --chat is required and consists in the chat id, to which the message is sent.
            `);
        } else {
            const message: string | undefined = args.message;
            const chatId: number | undefined = args.chat;
            if (!message) {
                throw new Error(
                    'The message is missing. Please pass the --message parameter. Pass --help for more information.'
                );
            }
            if (!chatId) {
                throw new Error(
                    'The chat id is missing. Please pass the --chat parameter. Pass --help for more information.'
                );
            }
            await executeTask(message, chatId);
        }
    } catch (error: any) {
        logger.error(error);
    }
})();
