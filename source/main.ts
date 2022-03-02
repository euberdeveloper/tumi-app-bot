import './utils/moduleAlias';

import { Logger } from 'euberlog';

import { Scraper } from '@/utils/scraper';
import { Database } from '@/utils/database';
import { Bot } from '@/utils/bot';
import { Scheduler } from '@/utils/scheduler';

import OPTIONS from '@/options';

const logger = new Logger('main');

async function main(): Promise<void> {
    logger.info('Starting...');

    const database = new Database({
        host: OPTIONS.redis.host,
        port: OPTIONS.redis.port
    });
    logger.debug('Database instance created');

    const scraper = new Scraper(OPTIONS.apiUrl, OPTIONS.registrationStartForwarning);
    logger.debug('Scraper instance created');

    const bot = new Bot(OPTIONS.telegram.botToken, database);
    logger.debug('Bot instance created');

    const scheduler = new Scheduler({
        host: OPTIONS.redis.host,
        port: OPTIONS.redis.port
    }, OPTIONS.scrapingCron, database, scraper, bot);
    await scheduler.startScheduler();
    logger.debug('Scheduler instance created');

    logger.success('Bot started succesfully!!!');
}
main();