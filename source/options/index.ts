import * as dotenv from 'dotenv';
import * as path from 'path';

const packageJson = require(path.join(process.cwd(), 'package.json'));

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

export default {
    apiUrl: process.env.API_URL ?? 'https://tumi.esn.world/graphql',
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT !== undefined ? +process.env.REDIS_PORT : 9379
    },
    scrapingCron: process.env.SCRAPING_CRON ?? '* * * * *',
    registrationStartForwarning: +(process.env.REGISTRATION_START_FOR_WARNING_SECS ?? 600) * 1000,
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN as string
    },
    version: packageJson.version
};