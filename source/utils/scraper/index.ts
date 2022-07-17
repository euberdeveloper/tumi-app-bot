import { gql, GraphQLClient } from 'graphql-request';

import { GraphqlResponse, HandledTumiEvent } from '@/types';

export class Scraper {
    private static readonly QUERY = gql`
        query eventList {
            events {
                id
                title
                start
                end
                registrationStart
                participantLimit
                participantRegistrationCount
                prices
            }
        }
    `;
    private readonly client: GraphQLClient;
    private readonly registrationStartForewarning: number;

    constructor(apiUrl: string, registrationStartForewarning: number) {
        this.client = new GraphQLClient(apiUrl, {
            headers: {
                // NOTE: strange fix to avoid "Invalid URL error"
                origin: 'http://localhost',
                referer: 'http://localhost/'
            }
        });
        this.registrationStartForewarning = registrationStartForewarning;
    }

    public async getEvents(): Promise<HandledTumiEvent[]> {
        const result = await this.client.request<GraphqlResponse>(Scraper.QUERY);
        const now = new Date();
        return result.events.map(event => ({
            ...event,
            registrationStartsSoon: +new Date(event.registrationStart) - +now < this.registrationStartForewarning,
            registrationStarted: new Date(event.registrationStart) <= now,
            prices: undefined,
            price:
                event.prices?.options.find(option => option.defaultPrice)?.amount ??
                (event.prices?.options[0] ? event.prices.options[0].amount : null)
        }));
    }
}
