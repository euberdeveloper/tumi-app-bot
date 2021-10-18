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

        const title = event.title;
        const date = new Date(event.start);
        const dateTxt = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
        const totSpots = event.participantLimit;
        const availableSpots = event.participantLimit - event.partecipantsRegistered;
        const price = event.price ? `${event.price}€` : '0€';
        const link = `https://tumi.esn.world/events/${event.id}`;

        switch (type) {
            case 'new':
                return `
                There is a new event "${title}", on ${dateTxt} with ${availableSpots}/${totSpots} spots available, with price ${price}
                The link to the event is ${link}
                `;
            case 'set_free':
                return `
                The event "${event.title}", on ${dateTxt} is again available, with ${availableSpots}/${totSpots} spots, with price ${price}.
                The link to the event is ${link}
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