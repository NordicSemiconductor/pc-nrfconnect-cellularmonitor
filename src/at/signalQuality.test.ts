import { Packet } from '../state';
import { convert, State } from './index';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

const subscribePacket = atPacket('AT%CESQ=1');
const unsubscribePacket = atPacket('AT%CESQ=0');

const signalQualityNotifications = [
    // Same indexes for reference
    { packet: atPacket('%CESQ: 0,0,0,0'), result: [0, 0, 0, 0] },
    { packet: atPacket('%CESQ: 20,0,7,0'), result: [20, 0, 7, 0] },
    { packet: atPacket('%CESQ: 21,1,18,1'), result: [21, 1, 18, 1] },
    { packet: atPacket('%CESQ: 30,1,10,1'), result: [30, 1, 10, 1] },
    { packet: atPacket('%CESQ: 39,1,13,1'), result: [39, 1, 13, 1] },
    { packet: atPacket('%CESQ: 40,2,14,2'), result: [40, 2, 14, 2] },
    { packet: atPacket('%CESQ: 50,2,17,2'), result: [50, 2, 17, 2] },
    { packet: atPacket('%CESQ: 59,2,20,2'), result: [59, 2, 20, 2] },
    { packet: atPacket('%CESQ: 60,3,21,3'), result: [60, 3, 21, 3] },
    { packet: atPacket('%CESQ: 70,3,25,3'), result: [70, 3, 25, 3] },
    { packet: atPacket('%CESQ: 79,3,27,3'), result: [79, 3, 27, 3] },
    { packet: atPacket('%CESQ: 80,4,28,4'), result: [80, 4, 28, 4] },
    { packet: atPacket('%CESQ: 90,4,30,4'), result: [90, 4, 30, 4] },
    { packet: atPacket('%CESQ: 97,4,34,4'), result: [97, 4, 34, 4] },

    // Mixes
    { packet: atPacket('%CESQ: 64,3,17,2'), result: [64, 3, 17, 2] },

    // Unknown
    {
        packet: atPacket('%CESQ: 255,255,255,255'),
        result: [255, 255, 255, 255],
    },
    {
        packet: atPacket('%CESQ: 255,255,17,2'),
        result: [255, 255, 17, 2],
    },
    {
        packet: atPacket('%CESQ: 64,3,255, 255'),
        result: [64, 3, 255, 255],
    },
];

const OkPacket = atPacket('OK\r\n');
const ErrorPacket = atPacket('ERROR\r\n');

const initialState = {
    notifySignalQuality: false,
    signalQuality: {
        rsrp: 255,
        rsrp_threshold_index: 255,
        rsrq: 255,
        rsrq_threshold_index: 255,
    },
} as State;

const convertPackets = (
    packets: Packet[],
    previousState = initialState
): State =>
    packets.reduce(
        (state, packet) => ({ ...state, ...convert(packet, state) }),
        previousState
    );

test('Subscribe to %CESQ signal quality sets correct viewModel', () => {
    const model = convertPackets([subscribePacket]);
    expect(model.notifySignalQuality).toBe(false);
    const modelOK = convertPackets([OkPacket], model);
    expect(modelOK.notifySignalQuality).toBe(true);
});

test('Subscribe to %CESQ signal quality followed by error should not write to state', () => {
    expect(
        convertPackets([subscribePacket, ErrorPacket]).notifySignalQuality
    ).toBe(false);
});

test('Notification of %CESQ may turned on and off', () => {
    expect(
        convertPackets([subscribePacket, unsubscribePacket]).notifySignalQuality
    ).toBe(false);

    expect(
        convertPackets([
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
            subscribePacket,
            OkPacket,
        ]).notifySignalQuality
    ).toBe(true);

    expect(
        convertPackets([
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
            unsubscribePacket,
            OkPacket,
        ]).notifySignalQuality
    ).toBe(false);
});

test('%CESQ notification properly updates signal quality', () => {
    const initialState = convertPackets([subscribePacket, OkPacket]);
    expect(initialState.notifySignalQuality).toBe(true);
    expect(Object.values(initialState.signalQuality)).toEqual([
        255, 255, 255, 255,
    ]);

    signalQualityNotifications.forEach((notification) => {
        const result = convertPackets([notification.packet], initialState);
        expect(Object.values(result.signalQuality)).toEqual(
            notification.result
        );
    });
});
