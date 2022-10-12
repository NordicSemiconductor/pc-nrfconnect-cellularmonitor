import type { Processor } from '.';

type ViewModel = { 
    availableBands?: number[];
    currentBand?: number;
};

export const processor: Processor<ViewModel> = {
    command: '%XCBAND',
    initialState: () => ({  }),
    documentation: 'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fref_at_commands%2FREF%2Fat_commands%2Fmob_termination_ctrl_status%2Fxcband.html&cp=2_1_4_9',
    response(packet) {
        if (packet.status === 'OK') {

            if (!packet.body?.includes('(')) {
                // Response to a set command e.g. %XCBAND: 13
                const currentBandString = /(\d+)/.exec(packet.body!)?.slice(1)[0];
                return currentBandString ? { currentBand: Number(currentBandString) } : {}
            } else {
                // Response to a test command, e.g. %XCBAND: (1,2,3,4,5)
                const availableBands = /\(([\d,]+)\)/g.exec(packet.body!)
                    ?.slice(1)[0]
                    ?.split(',')
                    .map((band) => parseInt(band));

                    return { availableBands };
            }

        }
        return { }
    },
};