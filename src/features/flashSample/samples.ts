import { net } from '@electron/remote';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getAppDataDir, getAppDir, logger } from 'pc-nrfconnect-shared';

export interface Firmware {
    file: string;
    type: 'Application' | 'Modem';
}

export interface Sample {
    title: string;
    description: string;
    documentation: string;
    fw: Firmware[];
}

export interface Samples {
    thingy91: Sample[];
    dk91: Sample[];
}

const fullPath = (file: string) =>
    join(getAppDir(), 'resources', 'firmware', file);

export const initialSamples: Samples = {
    thingy91: [
        {
            title: 'Asset Tracker V2',
            description:
                'This is the default application on your development kit.',
            documentation:
                'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html',
            fw: [
                {
                    type: 'Modem',
                    file: fullPath('mfw_nrf9160_1.3.3.zip'),
                },
                {
                    type: 'Application',
                    file: fullPath(
                        'thingy91_asset_tracker_v2_debug_2022-12-08_188a1603.hex'
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
            documentation:
                'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html',
            fw: [
                {
                    type: 'Modem',
                    file: fullPath('mfw_nrf9160_1.3.3.zip'),
                },
                {
                    type: 'Application',
                    file: fullPath(
                        'nrf9160dk_asset_tracker_v2_debug_2022-09-15_7a358cb7.hex'
                    ),
                },
            ],
        },
        {
            title: 'Serial LTE Monitor',
            description:
                'Use this application if you want to evaluate the modem using an external MCU.',
            documentation:
                'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/samples/nrf9160/slm_shell/README.html',
            fw: [
                {
                    type: 'Application',
                    file: fullPath('slm-with-trace.hex'),
                },
            ],
        },
        {
            title: 'Modem Shell',
            description:
                'The Modem Shell (MoSh) sample application enables you to test various device connectivity features, including data throughput.',
            documentation:
                'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/samples/nrf9160/modem_shell/README.html',
            fw: [
                {
                    type: 'Application',
                    file: fullPath(
                        'nrf9160dk_modem_shell_2022-12-08_188a1603.hex'
                    ),
                },
            ],
        },
        {
            title: 'AT Client',
            description:
                'The AT Client sample demonstrates the asynchronous serial communication taking place over UART to the nRF9160 modem. The sample enables you to use an external computer or MCU to send AT commands to the LTE-M/NB-IoT modem of your nRF9160 device',
            documentation:
                'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/samples/nrf9160/at_client/README.html',
            fw: [
                {
                    type: 'Application',
                    file: fullPath('nrf9160dk_ns_at_client_with_trace.hex'),
                },
            ],
        },
    ],
};

const SERVER_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/samples';
const DOWNLOAD_FOLDER = getAppDataDir();

export const downloadSampleIndex = fetch(`${SERVER_URL}/index.json`, {
    cache: 'no-cache',
}).then<Samples>(result => result.json());

export const downloadSample = (sample: Sample) =>
    Promise.all(sample.fw.map(fw => downloadFile(fw.file)));

export const downloadFile = async (fileName: string) => {
    const targetFile = downloadedFilePath(fileName);
    const url = `${SERVER_URL}/${fileName}`;

    if (existsSync(targetFile)) return;
    logger.info(`Sample not found locally, downloading ${url}`);

    const file = await new Promise<Buffer>((resolve, reject) => {
        const buffer: Buffer[] = [];
        net.request({ url })
            .on('response', response => {
                if (response.statusCode >= 400) {
                    reject(
                        new Error(
                            `Unable to download resource, maybe try to manually download ${url} into ${targetFile}`
                        )
                    );
                }
                response.on('data', data => buffer.push(data));
                response.on('end', () => resolve(Buffer.concat(buffer)));
                response.on('error', reject);
            })
            .on('error', reject)
            .end();
    });

    await writeFile(targetFile, file);
};

export const downloadedFilePath = (file: string) => join(DOWNLOAD_FOLDER, file);
