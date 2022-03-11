export interface GraphqlResponse {
    events: TumiEvent[];
}

// NOTE: the graphql schema is defined here: https://github.com/heddendorp/tumi/blob/272e52d7cd6755aa761d7a1307e35e312d0cdd87/server/schema.graphql
export interface TumiEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    registrationStart: string;
    participantLimit: number;
    partecipantsRegistered: number | undefined;
    prices: {
        options: {
            amount: number;
            defaultPrice: boolean;
        }[];
    } | null;
}

export interface HandledTumiEvent extends Omit<TumiEvent, 'prices'> {
    registrationStartsSoon: boolean;
    registrationStarted: boolean;
    price: number | null;
}

export interface Difference {
    type: 'new' | 'set_free' | 'registration_starts_soon' | 'registration_started';
    event: HandledTumiEvent;
}
