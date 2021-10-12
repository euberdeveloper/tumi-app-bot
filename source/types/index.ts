export interface TumiEvent {
    timestamp: Date;
    title: string;
    spots: number;
    link: string;
}

export interface Difference {
    type: 'new' | 'set_free';
    event: TumiEvent;
}