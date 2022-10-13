/**
 * @jest-environment node
 */

import { rawTraceData } from '../../data/trace';
import { convert, initialState, Packet } from '.';

const traceData = rawTraceData.map(
    jsonPacket =>
        ({
            format: jsonPacket.format,
            packet_data: new Uint8Array(jsonPacket.packet_data.data),
        } as Packet)
);

test('Trace is read properly', () => {
    let state = initialState();

    traceData.forEach(packet => {
        state = convert(packet, state);
    });

    expect(state.pinState).toBe('ready');
    expect(state.notifySignalQuality).toBe(true);
});
