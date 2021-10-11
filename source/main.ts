import { Scraper } from './utils/scraper';
import OPTIONS from './options';

async function main(): Promise<void> {
    const scraper = new Scraper(`${OPTIONS.baseUrl}${OPTIONS.eventsPath}`, OPTIONS.timeout);
    await scraper.init();
    const events = await scraper.getEvents();
    console.log(events);
    await scraper.destroy();
}
main();