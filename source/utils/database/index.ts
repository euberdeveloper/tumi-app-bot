import { promisify } from 'util';
import * as redis from 'redis';

import { TumiEvent } from '@/types';

export class Database {
    private static readonly EVENTS_KEY = 'tumiEvents';
    private static readonly CHATS_KEY = 'tumiChatsKey';

    private client: redis.RedisClient;

    private getAsync: (key: string) => Promise<string | null>;
    private setAsync: (key: string, value: string) => Promise<unknown>;
    private rpushAsync: (key: string, ...args: string[]) => Promise<unknown>;
    private lrangeAsync: (key: string, from: number, to: number) => Promise<string[]>;
    private quitAsync: () => Promise<'OK'>;

    constructor(options: redis.ClientOpts) {
        this.client = redis.createClient(options);
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.rpushAsync = promisify(this.client.rpush).bind(this.client);
        this.lrangeAsync = promisify(this.client.lrange).bind(this.client);
        this.quitAsync = promisify(this.client.quit).bind(this.client);
    }

    public async getEvents(): Promise<TumiEvent[] | null> {
        const jsonResponse = await this.getAsync(Database.EVENTS_KEY);
        return jsonResponse
            ? JSON.parse(jsonResponse).map((event: any) => {
                event.timestamp = new Date(event.timestamp);
                return event;
            })
            : jsonResponse;
    }

    public async setEvents(events: TumiEvent[]): Promise<void> {
        const jsonBody = JSON.stringify(events);
        await this.setAsync(Database.EVENTS_KEY, jsonBody);
    }

    public async pushChat(chatId: number): Promise<void> {
        await this.rpushAsync(Database.CHATS_KEY, '' + chatId);
    }

    public async getChats(): Promise<number[]> {
        const chatIds = await this.lrangeAsync(Database.CHATS_KEY, 0, -1);
        return chatIds.map(id => +id);
    }

    public async close(): Promise<void> {
        await this.quitAsync();
    }
}