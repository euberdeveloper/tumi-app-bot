import './utils/moduleAlias';

import { Scraper } from '@/utils/scraper';
import { Database } from '@/utils/database';
import { Scheduler } from '@/utils/scheduler';

import OPTIONS from '@/options';

async function main(): Promise<void> {
    const database = new Database({
        host: OPTIONS.redis.host,
        port: OPTIONS.redis.port
    });

    const scraper = new Scraper(`${OPTIONS.baseUrl}${OPTIONS.eventsPath}`, OPTIONS.timeout);
    await scraper.init();

    const scheduler = new Scheduler({
        host: OPTIONS.redis.host,
        port: OPTIONS.redis.port
    }, OPTIONS.scrapingCron, database, scraper);
    await scheduler.startScheduler();
}
main();