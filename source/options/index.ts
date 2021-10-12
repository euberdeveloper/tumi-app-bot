import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

export default {
    baseUrl: process.env.BASE_URL ?? 'https://tumi.esn.world',
    eventsPath: process.env.EVENTS_PATH ?? '/events',
    timeout: process.env.TIMEOUT !== undefined ? +process.env.TIMEOUT : 30000,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT !== undefined ? +process.env.REDIS_PORT : undefined
    }
};