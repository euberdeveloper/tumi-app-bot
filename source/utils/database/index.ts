/* eslint-disable @typescript-eslint/unbound-method */
import { promisify } from 'util';
import * as redis from 'redis';

import { HandledTumiEvent } from '@/types';

export class Database {
    private static readonly EVENTS_KEY = 'tumiEvents';
    private static readonly CHATS_KEY = 'tumiChatsKey';

    private readonly client: redis.RedisClient;

    private readonly getAsync: (key: string) => Promise<string | null>;
    private readonly setAsync: (key: string, value: string) => Promise<unknown>;
    private readonly saddAsync: (key: string, ...args: string[]) => Promise<number>;
    private readonly sremAsync: (key: string, value: string) => Promise<unknown>;
    private readonly smembersAsync: (key: string) => Promise<string[]>;
    private readonly quitAsync: () => Promise<'OK'>;

    constructor(options: redis.ClientOpts) {
        this.client = redis.createClient(options);
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.saddAsync = promisify(this.client.sadd).bind(this.client);
        this.sremAsync = promisify(this.client.srem).bind(this.client);
        this.smembersAsync = promisify(this.client.smembers).bind(this.client);
        this.quitAsync = promisify(this.client.quit).bind(this.client);
    }

    public async getEvents(): Promise<HandledTumiEvent[] | null> {
        const jsonResponse = await this.getAsync(Database.EVENTS_KEY);
        return jsonResponse ? JSON.parse(jsonResponse) : jsonResponse;
    }

    public async setEvents(events: HandledTumiEvent[]): Promise<void> {
        const jsonBody = JSON.stringify(events);
        await this.setAsync(Database.EVENTS_KEY, jsonBody);
    }

    public async pushChat(chatId: number): Promise<void> {
        await this.saddAsync(Database.CHATS_KEY, String(chatId));
    }

    public async removeChat(chatId: number): Promise<void> {
        await this.sremAsync(Database.CHATS_KEY, String(chatId));
    }

    public async getChats(): Promise<number[]> {
        const chatIds = await this.smembersAsync(Database.CHATS_KEY);
        return chatIds.map(id => +id);
    }

    public async close(): Promise<void> {
        await this.quitAsync();
    }
}
