import * as puppeteer from 'puppeteer';
import { Browser, Page, ElementHandle } from 'puppeteer';
import * as dateAndTime from 'date-and-time';

import { Event } from '@/types';

type TagElement = ElementHandle<Element>;

export class Scraper {
    private pageUrl: string;
    private timeout: number;

    private browser!: Browser;
    private page!: Page;
    private rootTag!: TagElement;

    private async getRootTag(): Promise<TagElement> {
        const rootSelector = 'tumi-event-list-page main tumi-grid > div';
        await this.page.waitForSelector(rootSelector, { timeout: this.timeout });
        const rootTag = await this.page.$(rootSelector);

        if (rootTag === null) {
            throw new Error('No root tag found');
        }

        return rootTag;
    }

    private isSpanChild(child: TagElement): boolean {
        return child._remoteObject.className === 'HTMLSpanElement';
    }
    private async getTagText(tag: TagElement): Promise<string> {
        const result = await tag.evaluate(el => el.textContent);

        if (result === null) {
            throw new Error('Tag has not text content');
        }

        return result;

    }
    private async getTagAttribute(tag: TagElement, attribute: string): Promise<string> {
        const result = await tag.evaluate((el, attribute) => el.getAttribute(attribute), attribute);

        if (result === null) {
            throw new Error(`Tag has not attribute ${attribute}`);
        }

        return result;

    }

    private async getLink(child: TagElement): Promise<string> {
        const tag = await child.$('a[fxLayout]');

        if (tag === null) {
            throw new Error(`Tag link not found`);
        }

        return this.getTagAttribute(tag, 'href');
    }

    private async getTitle(child: TagElement): Promise<string> {
        const tag = await child.$('p.font-bold');

        if (tag === null) {
            throw new Error(`Tag link not found`);
        }

        return this.getTagText(tag);
    }

    private async getTime(child: TagElement): Promise<string> {
        const tag = await child.$('p:not([class])');
        if (tag === null) {
            throw new Error(`Tag link not found`);
        }

        const time = await this.getTagText(tag);
        return time.split('Starts: ')[1]
    }

    private async getSpots(child: TagElement): Promise<number> {
        const tag = await child.$('p.ng-star-inserted');
        if (tag === null) {
            return 0;
        }

        const spots = await this.getTagText(tag);
        return !spots || !spots.includes('Available spots: ') ? 0 : +spots.split('Available spots: ')[1];
    }

    private async getEventsHelper(): Promise<Event[]> {
        const events: Event[] = [];

        const children = await this.rootTag.$$('div > span, div > tumi-event-list-item');

        const currentYear = new Date().getFullYear();
        let currentDate = '';

        for (const child of children) {
            if (this.isSpanChild(child)) {
                const dateString = await this.getTagText(child);
                currentDate = dateString.split(' ').slice(1).join(' ');
            }
            else {
                const title = await this.getTitle(child);
                const spots = await this.getSpots(child);
                const link = await this.getLink(child);
                const time = await this.getTime(child);

                const timestamp = dateAndTime.parse(`${currentDate} ${currentYear} ${time}`, 'DD MMMM YYYY h:mm A');

                events.push({
                    timestamp,
                    title,
                    spots,
                    link
                })
            }
        }

        return events;
    }

    public constructor(pageUrl: string, timeout: number) {
        this.pageUrl = pageUrl;
        this.timeout = timeout;
    }

    public async init(): Promise<void> {
        this.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        this.page = await this.browser.newPage();
        await this.page.goto(this.pageUrl);
    }

    public async getEvents(): Promise<Event[]> {
        this.rootTag = await this.getRootTag();
        return this.getEventsHelper();
    }

    public async destroy(): Promise<void> {
        await this.browser.close();
    }
}
