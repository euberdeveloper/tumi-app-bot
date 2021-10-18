export interface TumiEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    price: string | null;
    discountedPrice: string | null;
    participantLimit: number;
    partecipantsRegistered: number;
}

export interface Difference {
    type: 'new' | 'set_free';
    event: TumiEvent;
}