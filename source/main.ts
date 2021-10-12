import './utils/moduleAlias';

import { Scraper } from '@/utils/scraper';
import { Database } from '@/utils/database';
import OPTIONS from '@/options';

async function main(): Promise<void> {
    const database = new Database({
        host: OPTIONS.redis.host,
        port: OPTIONS.redis.port
    });
    const currEvents = await database.getEvents();
    console.log(currEvents);

    const scraper = new Scraper(`${OPTIONS.baseUrl}${OPTIONS.eventsPath}`, OPTIONS.timeout);
    await scraper.init();
    const events = await scraper.getEvents();
    await scraper.destroy();

    console.log('inserting')
    await database.setEvents(events);
    console.log('closing');
    await database.close();
}
main();