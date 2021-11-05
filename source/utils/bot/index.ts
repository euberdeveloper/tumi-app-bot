import { Telegraf } from 'telegraf';
import { Logger } from 'euberlog';
import * as dateAndTime from 'date-and-time';

import { Database } from '@/utils/database';
import { Difference } from '@/types';
import options from '@/options';

const logger = new Logger('bot');

export class Bot {
    private bot: Telegraf;
    private database: Database;

    private init(): void {
        const helpText = `Welcome, I am the bot that will notify you if a new tumi event arrives or if spots are set free!

Commands:
● <b>/start</b> will register you to the newsletter
● <b>/stop</b> will unregister you from the newsletter
● <b>/author</b> will show you information about the author and the source code
● <b>/version</b> will show you the bot version
● <b>/help</b> will show you this message again
        `;

        this.bot.start(async ctx => {
            logger.debug('Start command', ctx.chat);
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply(helpText, { parse_mode: 'HTML' });
        });
        this.bot.command('stop', async ctx => {
            logger.debug('Stop command', ctx.chat);
            await this.database.removeChat(ctx.chat.id);
            return ctx.reply('You have been deregistered. If you want to start receiving notifications again, use the <b>/start</b> command', { parse_mode: 'HTML' });
        });
        this.bot.command('author', ctx => {
            logger.debug('Author command', ctx.chat);
            return ctx.reply('The author of this bot is <i>Eugenio Berretta</i>, the bot is open source and visible at <i>https://github.com/euberdeveloper/tumi-app-bot</i>.', { parse_mode: 'HTML' });
        });
        this.bot.command('version', ctx => {
            logger.debug('Version command', ctx.chat);
            return ctx.reply(`The version of this bot is <b>${options.version}</b>`, { parse_mode: 'HTML' });
        });
        this.bot.help(ctx => {
            logger.debug('Help command', ctx.chat);
            return ctx.reply(helpText, { parse_mode: 'HTML' })
        });
        this.bot.launch();
    }

    private getMessageFromDifference(difference: Difference): string {
        const { type, event } = difference;

        const title = event.title;
        const date = new Date(event.start);
        const dateTxt = dateAndTime.format(date, 'DD/MM/YYYY HH:mm') ?? date;
        const totSpots = event.participantLimit;
        const availableSpots = event.participantLimit - (event.partecipantsRegistered ?? 0);
        const link = `https://tumi.esn.world/events/${event.id}`;

        switch (type) {
            case 'new':
                return `
                There is a new event <b>"${title}"</b>, on <b>${dateTxt}</b> with <b>${availableSpots}</b>/${totSpots} spots available.
The link to the event is ${link}
                `;
            case 'set_free':
                return `
                The event <b>"${event.title}"</b>, on <b>${dateTxt}</b> is again available, with <b>${availableSpots}</b>/${totSpots} spots.
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
            try {
                await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
            }
            catch (error) {
                logger.error(`Error sending message to chat ${chatId}`, error);
            }
        }
    }

}