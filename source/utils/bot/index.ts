/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Telegraf } from 'telegraf';
import { Logger } from 'euberlog';
import * as dateAndTime from 'date-and-time';
import * as dateAndTimeTimezone from 'date-and-time/plugin/timezone';

import { Database } from '@/utils/database';
import { Difference } from '@/types';
import options from '@/options';

const logger = new Logger('bot');
dateAndTime.plugin(dateAndTimeTimezone);

export class Bot {
    private readonly bot: Telegraf;
    private readonly database: Database;

    constructor(botToken: string, database: Database) {
        this.database = database;
        this.bot = new Telegraf(botToken);
        this.init();
    }

    private init(): void {
        const welcomeText = `Welcome, I am the bot that will notify you if a new tumi event arrives or if spots are set free!`;
        const commandsText = `
Commands:
● <b>/start</b> will register you to the newsletter
● <b>/stop</b> will unregister you from the newsletter
● <b>/author</b> will show you information about the author and the source code
● <b>/version</b> will show you the bot version
● <b>/help</b> will show you this message again
        `;

        const helpText = `${welcomeText}
        
${commandsText}`;
        const startText = `${welcomeText}

You have just been registered to the newsletter.

${commandsText}`;

        this.bot.start(async ctx => {
            logger.debug('Start command', ctx.chat);
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply(startText, { parse_mode: 'HTML' });
        });
        this.bot.command('stop', async ctx => {
            logger.debug('Stop command', ctx.chat);
            await this.database.removeChat(ctx.chat.id);
            return ctx.reply(
                'You have been deregistered. If you want to start receiving notifications again, use the <b>/start</b> command',
                { parse_mode: 'HTML' }
            );
        });
        this.bot.command('author', async ctx => {
            logger.debug('Author command', ctx.chat);
            return ctx.reply(
                'The author of this bot is <i>Eugenio Berretta</i>, the bot is open source and visible at <i>https://github.com/euberdeveloper/tumi-app-bot</i>.',
                { parse_mode: 'HTML' }
            );
        });
        this.bot.command('version', async ctx => {
            logger.debug('Version command', ctx.chat);
            return ctx.reply(`The version of this bot is <b>${options.version}</b>`, { parse_mode: 'HTML' });
        });
        this.bot.help(async ctx => {
            logger.debug('Help command', ctx.chat);
            return ctx.reply(helpText, { parse_mode: 'HTML' });
        });
        void this.bot.launch();
    }

    private getMessageFromDifference(difference: Difference): string {
        const { type, event } = difference;

        const title = event.title;
        const date = new Date(event.start);
        const dateTxt: string =
            (dateAndTime as any).formatTZ(date, 'DD/MM/YYYY HH:mm', 'Europe/Berlin') ??
            `${date.toLocaleString('de')} UTC`;
        const totSpots = event.participantLimit;
        const availableSpots = event.participantLimit - (event.participantsRegistered ?? 0);
        const price = event.price ? `(<b>${event.price}€</b>)` : '';
        const link = `https://tumi.esn.world/events/${event.id}`;

        switch (type) {
            case 'new':
                return `
                There is a new available event <b>"${title}"</b>, on <b>${dateTxt}</b> with <b>${availableSpots}</b>/${totSpots} spots available ${price}.
The link to the event is ${link}
                `;
            case 'set_free':
                return `
                The event <b>"${event.title}"</b>, on <b>${dateTxt}</b> is again available, with <b>${availableSpots}</b>/${totSpots} spots ${price}.
The link to the event is ${link}
                `;
            case 'registration_starts_soon':
                return `
                <b>Soon</b> will start the registration for the event <b>"${event.title}"</b>, on <b>${dateTxt}</b>, with <b>${availableSpots}</b>/${totSpots} spots ${price}.
The link to the event is ${link}
                `;
            case 'registration_started':
                return `
                <b>Registration started</b> for the event <b>"${event.title}"</b>, on <b>${dateTxt}</b>, with <b>${availableSpots}</b>/${totSpots} spots ${price}.
The link to the event is ${link}
                `;
        }
    }

    public async sendMessageToChat(message: string, chatId: number): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } catch (error) {
            logger.error(`Error sending message to chat ${chatId}`, error);
        }
    }

    public async sendMessageToEveryone(message: string): Promise<void> {
        const chattIds = await this.database.getChats();
        const tasks = chattIds.map(async chatId => this.sendMessageToChat(message, chatId));
        await Promise.all(tasks);
    }

    public async sendNotificationMessage(difference: Difference): Promise<void> {
        const message = this.getMessageFromDifference(difference);
        await this.sendMessageToEveryone(message);
    }

    public close(): void {
        this.bot.stop();
    }
}
