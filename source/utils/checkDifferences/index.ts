import { Difference, TumiEvent } from "@/types";

export function checkDifferences(oldEvents: TumiEvent[] | null, newEvents: TumiEvent[]): Difference[] {
    const differences: Difference[] = [];

    if (oldEvents !== null) {
        for (const newEvent of newEvents) {

            const oldEvent = oldEvents.find(event => event.id === newEvent.id);

            if (!oldEvent) {
                differences.push({
                    type: 'new',
                    event: newEvent
                })
            }
            else if (oldEvent.participantLimit !== null && newEvent.participantLimit !== null && oldEvent.participantLimit - oldEvent.partecipantsRegistered <= 0 && newEvent.participantLimit - newEvent.partecipantsRegistered > 0) {
                differences.push({
                    type: 'set_free',
                    event: newEvent
                })
            }
        }
    }


    return differences;
}