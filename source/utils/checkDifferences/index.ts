/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Difference, HandledTumiEvent } from '@/types';

export function checkDifferences(oldEvents: HandledTumiEvent[] | null, newEvents: HandledTumiEvent[]): Difference[] {
    const differences: Difference[] = [];

    if (oldEvents !== null) {
        for (const newEvent of newEvents) {
            const oldEvent = oldEvents.find(event => event.id === newEvent.id);

            if (!oldEvent) {
                differences.push({
                    type: 'new',
                    event: newEvent
                });
            } else if (
                oldEvent.participantLimit !== null &&
                newEvent.participantLimit !== null &&
                oldEvent.participantLimit - (oldEvent.participantRegistrationCount ?? 0) <= 0 &&
                newEvent.participantLimit - (newEvent.participantRegistrationCount ?? 0) > 0
            ) {
                differences.push({
                    type: 'set_free',
                    event: newEvent
                });
            } else if (!oldEvent.registrationStarted && newEvent.registrationStarted) {
                differences.push({
                    type: 'registration_started',
                    event: newEvent
                });
            } else if (!oldEvent.registrationStartsSoon && newEvent.registrationStartsSoon) {
                differences.push({
                    type: 'registration_starts_soon',
                    event: newEvent
                });
            }
        }
    }

    return differences;
}
