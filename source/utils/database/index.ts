import { promisify } from 'util';
import * as redis from 'redis';

import { TumiEvent } from '@/types';

export class Database {
    private client: redis.RedisClient;

    private getAsync: (key: string) => Promise<string | null>;
    private setAsync: (key: string, value: string) => Promise<unknown>;
    private quitAsync: () => Promise<'OK'>;

    constructor(options: redis.ClientOpts) {
        this.client = redis.createClient(options);
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.quitAsync = promisify(this.client.quit).bind(this.client);
    }

    public async getEvents(): Promise<TumiEvent[] | null> {
        const jsonResponse = await this.getAsync('events');
        return jsonResponse
            ? JSON.parse(jsonResponse).map((event: any) => {
                event.timestamp = new Date(event.timestamp);
                return event;
            })
            : jsonResponse;
    }

    public async setEvents(events: TumiEvent[]): Promise<void> {
        const jsonBody = JSON.stringify(events);
        await this.setAsync('events', jsonBody);
    }

    public async close(): Promise<void> {
        await this.quitAsync();
    }
}