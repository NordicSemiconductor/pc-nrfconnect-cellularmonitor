import { join } from 'path';
import { getAppDir } from 'pc-nrfconnect-shared';

export interface Sample {
    title: string;
    description: string;
    fw: { file: string; type: 'Application' | 'Modem' }[];
}

export const samples: { [key: string]: Sample[] } = {
    thingy91: [
        {
            title: 'Asset Tracker V2',
            description:
                'This is the default application on your development kit.',
            fw: [
                {
                    type: 'Modem',
                    file: join(
                        getAppDir(),
                        'resources',
                        'firmware',
                        'mfw_nrf9160_1.3.3.zip'
                    ),
                },
                {
                    type: 'Application',
                    file: join(
                        getAppDir(),
                        'resources',
                        'firmware',
                        'nrf9160dk_asset_tracker_v2_debug_2022-09-15_7a358cb7.hex'
                    ),
                },
            ],
        },
    ],

    dk91: [
        {
            title: 'Asset Tracker V2',
            description:
                'This is the default application on your development kit.',
            fw: [
                {
                    type: 'Modem',
                    file: join(
                        getAppDir(),
                        'resources',
                        'firmware',
                        'mfw_nrf9160_1.3.3.zip'
                    ),
                },
                {
                    type: 'Application',
                    file: join(
                        getAppDir(),
                        'resources',
                        'firmware',
                        'thingy91_asset_tracker_v2_debug_2022-12-08_188a1603.hex'
                    ),
                },
            ],
        },
        {
            title: 'Serial LTE Monitor',
            description:
                'Use this application if you want to evaluate the modem using an external MCU.',
            fw: [],
        },
        {
            title: 'Modem Shell',
            description:
                'Use this application if you want to evaluet the data rate and stuff 🙂',
            fw: [],
        },
    ],
};
