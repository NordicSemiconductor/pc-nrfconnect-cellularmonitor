/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import createSinkFile from './sinkFile';

jest.mock('@nordicsemiconductor/pc-nrfconnect-shared', () => ({
    ...jest.requireActual('@nordicsemiconductor/pc-nrfconnect-shared'),
    getAppDataDir: () => 'data/dir',
}));

describe('sink file names', () => {
    it('is for file sources based on the source file name', () => {
        const sinkFile = createSinkFile(
            { type: 'file', path: 'some/file.mtrace' },
            'pcap',
        );

        expect(sinkFile).toBe(path.join('some', 'file.pcapng'));
    });

    it('is for device sources based on the start time, resilient to passing time', done => {
        const startTime = new Date('2021-12-24T01:02:03.456Z');

        const sinkFile = createSinkFile(
            { type: 'device', port: 'a port', startTime },
            'raw',
        );
        expect(sinkFile).toBe(
            path.join(
                'data',
                'dir',
                `trace-${startTime.toISOString().replace(/:/g, '-')}.mtrace`,
            ),
        );

        setTimeout(() => {
            const sinkFileAfter10Milliseconds = createSinkFile(
                { type: 'device', port: 'a port', startTime },
                'raw',
            );
            expect(sinkFileAfter10Milliseconds).toBe(
                path.join(
                    'data',
                    'dir',
                    `trace-${startTime.toISOString().replace(/:/g, '-')}.mtrace`,
                ),
            );
            done();
        }, 10);
    });
});
