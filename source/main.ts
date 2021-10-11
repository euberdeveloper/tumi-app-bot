import * as puppeteer from 'puppeteer';
import * as dateAndTime from 'date-and-time';

import OPTIONS from './options';

export interface Event {
    timestamp: Date;
    title: string;
    spots: number;
    link: string;
}

async function main(): Promise<void> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(OPTIONS.link);
    await page.waitForSelector('tumi-event-list-page main tumi-grid > div', { timeout: 30000 });
    const rootTag = await page.$('tumi-event-list-page main tumi-grid > div');
    if (rootTag) {
        const children = await rootTag.$$('div > span, div > tumi-event-list-item');

        let currentDate = '';
        const currentYear = new Date().getFullYear();
        const events: Event[] = [];
        for (const child of children) {
            if (child._remoteObject.className === 'HTMLSpanElement') {
                const dateString = await child.evaluate(el => el.textContent) as string;
                currentDate = dateString.split(' ').slice(1).join(' ');
            }
            else {
                const linkTag = await child.$('a[fxLayout]');
                const link = await linkTag?.evaluate(el => el.getAttribute('href')) as string;

                const titleTag = await child.$('p.font-bold');
                const title = await titleTag?.evaluate(el => el.textContent) as string;

                const timeTag = await child.$('p:not([class])');
                const time = (await timeTag?.evaluate(el => el.textContent))?.split('Starts: ')[1];
                
                const spotsTag = await child.$('p.ng-star-inserted');
                const spotsRaw = await spotsTag?.evaluate(el => el.textContent);
                const spots = !spotsRaw || !spotsRaw.includes('Available spots: ') ? 0 : +spotsRaw.split('Available spots: ')[1];
                
                const timestamp = dateAndTime.parse(`${currentDate} ${currentYear} ${time}`, 'DD MMMM YYYY h:mm A');

                events.push({
                    timestamp,
                    title,
                    spots,
                    link
                })
            }
        }

        console.log(events);

    }
    await browser.close();
}
main();