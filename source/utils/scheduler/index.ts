import * as Bull from 'bull';
import { Logger } from 'euberlog';

import { Database } from '@/utils/database';
import { Scraper } from '@/utils/scraper';
import { checkDifferences } from '@/utils/checkDifferences';
import { Bot } from '@/utils/bot';

const logger = new Logger('scheduler');

export class Scheduler {
    private static readonly JOB_NAME = 'scraping';

    private readonly queueName = 'jobs';
    private readonly bull: Bull.Queue;
    private readonly scrapingCron: string;
    private readonly database: Database;
    private readonly scraper: Scraper;
    private readonly bot: Bot;

    constructor(
        dbOptions: { host: string; port: number },
        scrapingCron: string,
        database: Database,
        scraper: Scraper,
        bot: Bot
    ) {
        this.bull = new Bull(this.queueName, {
            redis: dbOptions
        });
        this.scrapingCron = scrapingCron;
        this.database = database;
        this.scraper = scraper;
        this.bot = bot;

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        void this.bull.process(Scheduler.JOB_NAME, async () => {
            await this.executeJob();
        });
    }

    private async removeOldCrons(bull: Bull.Queue, jobName: string): Promise<void> {
        const oldJobsKeys = (await bull.getRepeatableJobs()).filter(j => j.name === jobName).map(j => j.key);
        for (const oldJobKey of oldJobsKeys) {
            await bull.removeRepeatableByKey(oldJobKey);
        }
    }

    public async executeJob(): Promise<void> {
        logger.info('Started job');
        try {
            const oldEvents = await this.database.getEvents();
            const newEvents = await this.scraper.getEvents();
            await this.database.setEvents(newEvents);
            const differences = checkDifferences(oldEvents, newEvents);

            for (const difference of differences) {
                await this.bot.sendMessage(difference);
            }

            logger.success('Finished job');
        } catch (error) {
            logger.error('Error in scheduler', error);
        }
    }

    public async startScheduler(): Promise<void> {
        await this.removeOldCrons(this.bull, Scheduler.JOB_NAME);
        await this.bull.add(Scheduler.JOB_NAME, null, { repeat: { cron: this.scrapingCron } });
    }
}
