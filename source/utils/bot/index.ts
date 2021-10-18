import { Telegraf } from 'telegraf';
import * as dateAndTime from 'date-and-time';

import { Database } from '@/utils/database';
import { Difference } from '@/types';

export class Bot {
    private bot: Telegraf;
    private database: Database;

    private init(): void {
        const helpText = `Welcome, I am the bot that will notify you if a new tumi event arrives or if spots are set free!

Commands:
● <b>/start</b> will register you to the newsletter
● <b>/stop</b> will unregister you from the newsletter
● <b>/help</b> will show you this message again
        `;

        this.bot.start(async ctx => {
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply(helpText, { parse_mode: 'HTML' });
        });
        this.bot.command('stop', async ctx => {
            await this.database.removeChat(ctx.chat.id);
            return ctx.reply('You have been deregistered. If you want to start receiving notifications again, use the <b>/start</b> command', { parse_mode: 'HTML' });
        });
        this.bot.help(ctx => ctx.reply(helpText, { parse_mode: 'HTML' }));
        this.bot.launch();
    }

    private getMessageFromDifference(difference: Difference): string {
        const { type, event } = difference;

        const title = event.title;
        const date = new Date(event.start);
        const dateTxt = dateAndTime.format(date, 'DD/MM/YYYY HH:mm') ?? date;
        const totSpots = event.participantLimit;
        const availableSpots = event.participantLimit - event.partecipantsRegistered;
        const price = event.price ? `${event.price}€` : '0€';
        const discounted = event.discountedPrice ? `(discounted to ${event.discountedPrice}€)` : '';
        const link = `https://tumi.esn.world/events/${event.id}`;

        switch (type) {
            case 'new':
                return `
                There is a new event <b>"${title}"</b>, on <b>${dateTxt}</b> with <b>${availableSpots}</b>/${totSpots} spots available, with price <b>${price}${discounted}</b>.
The link to the event is ${link}
                `;
            case 'set_free':
                return `
                The event <b>"${event.title}"</b>, on <b>${dateTxt}</b> is again available, with <b>${availableSpots}</b>/${totSpots} spots, with price <b>${price}${discounted}</b>.
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
            await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
    }

}