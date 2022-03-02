import { gql, GraphQLClient } from 'graphql-request';

import { GraphqlResponse, HandledTumiEvent } from '@/types';

export class Scraper {
  private static readonly QUERY = gql`
    {
        events {
          id
          title
          start
          end
          registrationStart
          participantLimit
          participantsRegistered
        }
      }
    `;
  private client: GraphQLClient;
  private registrationStartForewarning: number;


  public constructor(apiUrl: string, registrationStartForewarning: number) {
    this.client = new GraphQLClient(apiUrl);
    this.registrationStartForewarning = registrationStartForewarning;
  }

  public async getEvents(): Promise<HandledTumiEvent[]> {
    const result = await this.client.request<GraphqlResponse>(Scraper.QUERY);
    const now = new Date();
    return result.events.map(event => ({
      ...event,
      registrationStartsSoon: +new Date(event.registrationStart) - +now < this.registrationStartForewarning,
      registrationStarted: new Date(event.registrationStart) <= now,
    }));
  }

}
