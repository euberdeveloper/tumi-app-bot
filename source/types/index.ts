export interface GraphqlResponse {
    events: TumiEvent[];
}

export interface TumiEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    participantLimit: number;
    partecipantsRegistered: number | undefined;
}

export interface Difference {
    type: 'new' | 'set_free';
    event: TumiEvent;
}