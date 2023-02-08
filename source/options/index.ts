import * as dotenv from 'dotenv';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const packageJson = require(path.join(process.cwd(), 'package.json'));

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = process.env.REDIS_PORT ?? 6379;

export default {
    apiUrl: process.env.API_URL ?? 'https://tumi.esn.world/graphql',
    redis: {
        host: redisHost,
        port: redisPort,
        url: `redis://${redisHost}:${redisPort}`
    },
    scrapingCron: process.env.SCRAPING_CRON ?? '* * * * *',
    registrationStartForwarning: +(process.env.REGISTRATION_START_FOREWARNING_SECS ?? 600) * 1000,
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN as string
    },
    version: packageJson.version as string
};
