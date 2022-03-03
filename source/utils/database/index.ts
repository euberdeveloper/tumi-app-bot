import * as redis from 'redis';

import { HandledTumiEvent } from '@/types';

export class Database {
    private static readonly EVENTS_KEY = 'tumiEvents';
    private static readonly CHATS_KEY = 'tumiChatsKey';

    private readonly client: redis.RedisClientType;

    constructor(options: redis.RedisClientOptions) {
        this.client = redis.createClient(options);
    }

    public async open(): Promise<void> {
        await this.client.connect();
    }

    public async getEvents(): Promise<HandledTumiEvent[] | null> {
        const jsonResponse = await this.client.get(Database.EVENTS_KEY);
        return jsonResponse ? JSON.parse(jsonResponse) : jsonResponse;
    }

    public async setEvents(events: HandledTumiEvent[]): Promise<void> {
        const jsonBody = JSON.stringify(events);
        await this.client.set(Database.EVENTS_KEY, jsonBody);
    }

    public async resetEvents(): Promise<void> {
        await this.client.del(Database.EVENTS_KEY);
    }

    public async pushChat(chatId: number): Promise<void> {
        await this.client.sAdd(Database.CHATS_KEY, String(chatId));
    }

    public async removeChat(chatId: number): Promise<void> {
        await this.client.sRem(Database.CHATS_KEY, String(chatId));
    }

    public async resetChats(): Promise<void> {
        await this.client.del(Database.CHATS_KEY);
    }

    public async importChats(chats: number[]): Promise<void> {
        for (const chatId of chats) {
            await this.pushChat(chatId);
        }
    }

    public async getChats(): Promise<number[]> {
        const chatIds = await this.client.sMembers(Database.CHATS_KEY);
        return chatIds.map(id => +id);
    }

    public async close(): Promise<void> {
        await this.client.quit();
    }
}
