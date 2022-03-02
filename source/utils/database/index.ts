import { promisify } from 'util';
import * as redis from 'redis';

import { HandledTumiEvent } from '@/types';

export class Database {
    private static readonly EVENTS_KEY = 'tumiEvents';
    private static readonly CHATS_KEY = 'tumiChatsKey';

    private client: redis.RedisClient;

    private getAsync: (key: string) => Promise<string | null>;
    private setAsync: (key: string, value: string) => Promise<unknown>;
    private saddAsync: (key: string, ...args: string[]) => Promise<number>;
    private sremAsync: (key: string, value: string) => Promise<unknown>;
    private smembersAsync: (key: string) => Promise<string[]>;
    private quitAsync: () => Promise<'OK'>;

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
        return jsonResponse
            ? JSON.parse(jsonResponse).map((event: any) => {
                event.timestamp = new Date(event.timestamp);
                return event;
            })
            : jsonResponse;
    }

    public async setEvents(events: HandledTumiEvent[]): Promise<void> {
        const jsonBody = JSON.stringify(events);
        await this.setAsync(Database.EVENTS_KEY, jsonBody);
    }

    public async pushChat(chatId: number): Promise<void> {
        await this.saddAsync(Database.CHATS_KEY, '' + chatId);
    }

    public async removeChat(chatId: number): Promise<void> {
        await this.sremAsync(Database.CHATS_KEY, '' + chatId);
    }

    public async getChats(): Promise<number[]> {
        const chatIds = await this.smembersAsync(Database.CHATS_KEY);
        return chatIds.map(id => +id);
    }

    public async close(): Promise<void> {
        await this.quitAsync();
    }
}