import { Difference, TumiEvent } from "@/types";

export function checkDifferences(oldEvents: TumiEvent[] | null, newEvents: TumiEvent[]): Difference[] {
    const differences: Difference[] = [];

    if (oldEvents !== null) {
        for (const newEvent of newEvents) {
            const oldEvent = oldEvents.find(event => event.link === newEvent.link);

            if (!oldEvent) {
                differences.push({
                    type: 'new',
                    event: newEvent
                })
            }
            else if (oldEvent.spots === 0 && newEvent.spots > 0) {
                differences.push({
                    type: 'set_free',
                    event: newEvent
                })
            }
        }
    }


    return differences;
}