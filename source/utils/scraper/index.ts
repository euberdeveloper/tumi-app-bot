import { gql, GraphQLClient } from 'graphql-request';

import { GraphqlResponse, TumiEvent } from '@/types';

export class Scraper {


    private static readonly QUERY = gql`
    {
        events {
          id
          title
          start
          end
          participantLimit
          participantsRegistered
        }
      }
    `;
    private client: GraphQLClient;


    public constructor(apiUrl: string) {
        this.client = new GraphQLClient(apiUrl);
    }

    public async getEvents(): Promise<TumiEvent[]> {
        const result = await this.client.request<GraphqlResponse>(Scraper.QUERY);
        return result.events;
    }

}
