import { gql, GraphQLClient } from 'graphql-request';

import { TumiEvent } from '@/types';

export class Scraper {


    private static readonly QUERY = gql`
    {
        events {
          id
          title
          start
          end
          price
          discountedPrice
          participantLimit
          participantsRegistered
        }
      }
    `;
    private client: GraphQLClient;


    public constructor(apiUrl: string) {
        console.log(apiUrl)
        this.client = new GraphQLClient(apiUrl);
    }

    public async getEvents(): Promise<TumiEvent[]> {
        const result = await this.client.request<TumiEvent[]>(Scraper.QUERY);
        console.log(result);
        return result;
    }

}
