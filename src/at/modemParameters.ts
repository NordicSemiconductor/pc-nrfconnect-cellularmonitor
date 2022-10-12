import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

enum regStatus {
    NOT_REGISTERED = 0,
    REGISTERED = 1,
    NOT_REGISTERED_SEARCHING = 2,
    REGISTRATION_DENIED = 3,
    UNKNOWN = 4,
    REGISTERED_ROAMING = 5,
    UUIC_FAILURE = 90,
}

type ViewModel = {
    xmonitor?: {
        regStatus?: number;
        operatorFullName?: string;
        operatorShortName?: string;
        plmn?: string;
        tac?: string;
        AcT?: 7 | 9;
        band?: number;
        cell_id?: string;
        phys_cell_id?: number;
        EARFCN?: number;
        rsrp?: number;
        snr?: number;
        NW_provided_eDRX_value?: string;
        // Response is always either
        // activeTime & periodicTAU, or
        // activeTime & periodicTAUext & periodicTAU
        activeTime?: string;
        periodicTAU?: string;
        periodicTAUext?: string;
    };
};

export const processor: Processor<ViewModel> = {
    command: '%XMONITOR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/xmonitor.html',
    initialState: () => ({
        xmonitor: {
            regStatus: 0,
        },
    }),
    response(packet) {
        if (packet.status?.startsWith('OK')) {
            const responseParameters = getParametersFromResponse(packet.body);
            if (!responseParameters) {
                return {};
            }

            return {
                xmonitor: {
                    regStatus: responseParameters[0],
                    operatorFullName: responseParameters[1],
                    operatorShortName: responseParameters[2],
                    plmn: responseParameters[3],
                    tac: responseParameters[4],
                    AcT: responseParameters[5],
                    band: responseParameters[6],
                    cell_id: responseParameters[7],
                    phys_cell_id: responseParameters[8],
                    EARFCN: responseParameters[9],
                    rsrp: responseParameters[10],
                    snr: responseParameters[11],
                    NW_provided_eDRX_value: responseParameters[12],
                    // Response is always either
                    // activeTime & periodicTAU, or
                    // activeTime & periodicTAUext & periodicTAU
                    activeTime: responseParameters[13],
                    periodicTAU:
                        responseParameters.length === 15
                            ? responseParameters[14]
                            : responseParameters[15],
                    periodicTAUext:
                        responseParameters.length === 16
                            ? responseParameters[14]
                            : undefined,
                },
            };
        }
        return {};
    },
};
