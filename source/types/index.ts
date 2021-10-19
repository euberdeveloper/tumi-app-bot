export interface GraphqlResponse {
    events: TumiEvent[];
}

export interface TumiEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    price: string | null;
    discountedPrice: string | null;
    participantLimit: number;
    partecipantsRegistered: number | undefined;
}

export interface Difference {
    type: 'new' | 'set_free';
    event: TumiEvent;
}