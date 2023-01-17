import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

export const processor: Processor = {
    command: '%XMONITOR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/xmonitor.html',
    initialState: () => ({
        xmonitor: {
            regStatus: 0,
        },
    }),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const responseArray = getParametersFromResponse(packet.payload);
            if (responseArray.length !== 15 && responseArray.length !== 16) {
                return {};
            }

            const parsedAcT = parseInt(responseArray[5], 10);
            const evaluatedAcT =
                parsedAcT === 7 || parsedAcT === 9 ? parsedAcT : undefined;

            
        return {}
    },
};
