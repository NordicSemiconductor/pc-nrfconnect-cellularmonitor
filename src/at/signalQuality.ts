// export const convert = (
//     packet: Packet,
//     state: ViewModel
// ): Partial<ViewModel> => {
//     const payload = packet.packet_data.toString().toLowerCase();

//     // #### AT%<CMD>
//     if (payload.startsWith('at')) {
//         if (payload.includes('%cesq=1')) {
//             return {
//                 waitingAT: '%cesq',
//                 notifications: {
//                     ...state.notifications,
//                     signalQuality: true,
//                 },
//             };
//         }
//         if (payload.includes('%cesq=0')) {
//             return {
//                 waitingAT: '%cesq',
//                 notifications: {
//                     ...state.notifications,
//                     signalQuality: false,
//                 },
//             };
//         }
//     }

//     if (payload.includes('%cesq')) {
//         let signalPayload = payload
//             .slice(payload.indexOf(':') + 1)
//             .trim()
//             .split(',')
//             .map((value) => Number.parseInt(value));
//         return {
//             ...state,
//             signalQuality: {
//                 rsrp: signalPayload[0],
//                 rsrp_threshold_index: signalPayload[1],
//                 rsrq: signalPayload[2],
//                 rsrq_threshold_index: signalPayload[3],
//             },
//         };
//     }

//     // #### %<CMD> <OK>
//     if (payload.includes('ok')) {
//         return {
//             waitingAT: null,
//         };
//     }

//     // #### <OK> or <ERROR>
//     // TODO: Refactor into a general purpose file?
//     // Because this will be similar for all waitingAT commands anyway?
//     if (payload.includes('error')) {
//         return { waitingAT: null };
//     }

//     return {};
// };

import type { Processor } from '.';

type ViewModel = {
    notifySignalQuality?: boolean;
    signalQuality: {
        rsrp: number;
        rsrp_threshold_index: number;
        rsrq: number;
        rsrq_threshold_index: number;
    };
};

let tentativeState: Partial<ViewModel> | null = null;

export const processor: Processor<ViewModel> = {
    command: '%CESQ',
    documentation: 'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fproc_cesq.html&cp=2_1_4_3',
    initialState: () => ({
        notifySignalQuality: false,
        signalQuality: {
            rsrp: 255,
            rsrp_threshold_index: 255,
            rsrq: 255,
            rsrq_threshold_index: 255,
        },
    }),
    request(packet) {
        if (packet.body?.startsWith('1')) {
            tentativeState = { notifySignalQuality: true };
            return {};
        }
        if (packet.body?.startsWith('0')) {
            tentativeState = { notifySignalQuality: false };
            return {};
        }
        return {};
    },
    response(packet) {
        if (packet.body?.startsWith('OK')) {
            if (tentativeState != null) {
                return tentativeState;
            }
        }
        return {};
    },
    notification(packet) {
        const signalQualityValues = packet.body
            ?.slice(packet.body?.indexOf(':') + 1)
            .trim()
            .split(',')
            .map((value) => parseInt(value.trim()));

        if (signalQualityValues?.length === 4) {
            return {
                signalQuality: {
                    rsrp: signalQualityValues[0],
                    rsrp_threshold_index: signalQualityValues[1],
                    rsrq: signalQualityValues[2],
                    rsrq_threshold_index: signalQualityValues[3],
                },
            };
        }
        return {};
    },
};
