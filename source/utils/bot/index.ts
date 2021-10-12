import { Telegraf } from 'telegraf';

import { Database } from '@/utils/database';
import { Difference } from '@/types';

export class Bot {
    private bot: Telegraf;
    private database: Database;

    private init(): void {
        this.bot.start(async ctx => {
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply('Welcome, I am the bot that will notify you if a new tumi event arrives or if spots are set free!');
        });
        this.bot.help(ctx => ctx.reply('Welcome, I am the bot that will notify you if a new tumi event arrives or if spots are set free!'));
        this.bot.launch();
    }

    private getMessageFromDifference(difference: Difference): string {
        const { type, event } = difference;
        switch (type) {
            case 'new':
                return `
                There is a new event "${event.title}", on ${event.timestamp.toISOString()} with ${event.spots} spots available.
                The link to the event is ${event.link}
                `;
            case 'set_free':
                return `
                The event "${event.title}", on ${event.timestamp.toISOString()} is again available, with ${event.spots} spots.
                The link to the event is ${event.link}
                `;
        }
    }

    constructor(botToken: string, database: Database) {
        this.database = database;
        this.bot = new Telegraf(botToken);
        this.init();
    }

    public async sendMessage(difference: Difference): Promise<void> {
        const message = this.getMessageFromDifference(difference);
        const chatIds = await this.database.getChats();
        for (const chatId of chatIds) {
            await this.bot.telegram.sendMessage(chatId, message);
        }
    }

}