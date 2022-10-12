import { convert, initialState } from '.';

import * as traceDataJson from '../../data/trace.json';
import { Packet } from '../state';

const traceData = traceDataJson.map<Packet>((jsonPacket) => ({
    format: jsonPacket.format,
    packet_data: new Uint8Array(jsonPacket.packet_data.data),
}));

test('Trace is read properly', () => {
    let state = initialState();

    traceData.forEach((packet) => {
        state = convert(packet, state);
    });

    expect(state.pinState).toBe('ready');
    expect(state.notifySignalQuality).toBe(true);
});
