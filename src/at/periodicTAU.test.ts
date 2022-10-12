// import { initialViewModel, Packet, ViewModel } from '../state';
// import { convert } from './index';

// const encoder = new TextEncoder();
// const encode = (txt: string) => Buffer.from(encoder.encode(txt));
// const atPacket = (txt: string): Packet => ({
//     format: 'at',
//     packet_data: encode(txt),
// });

// const subscribePacket = atPacket('AT%XT3412=1,2000,30000');
// const unsubscribePacket = atPacket('AT%XT3412=0');

// const signalQualityNotifications = [
//     { packet: atPacket('%XT3412: 1200000'), result: 1200000 },
// ];

// const OkPacket = atPacket('OK\r\n');

// const convertPackets = (
//     packets: Packet[],
//     previousState?: ViewModel
// ): ViewModel =>
//     packets.reduce(
//         (state, packet) => ({ ...state, ...convert(packet, state) }),
//         previousState ? previousState : initialViewModel()
//     );

// test('Subscribe to %XT3412 signal quality sets correct viewModel', () => {
//     expect(
//         convertPackets([subscribePacket, OkPacket]).notifications.XT3412
//     ).toBe(true);
// });

// test('Subscribe and unsubscribe of %3412 may turned on and off', () => {
//     expect(
//         convertPackets([subscribePacket, unsubscribePacket]).notifications
//             .XT3412
//     ).toBe(false);

//     expect(
//         convertPackets([
//             subscribePacket,
//             OkPacket,
//             subscribePacket,
//             OkPacket,
//             subscribePacket,
//             OkPacket,
//         ]).notifications.XT3412
//     ).toBe(true);

//     expect(
//         convertPackets([
//             unsubscribePacket,
//             OkPacket,
//             unsubscribePacket,
//             OkPacket,
//             unsubscribePacket,
//             OkPacket,
//         ]).notifications.XT3412
//     ).toBe(false);
// });

// test('%3412 notification properly updates remaining T3412 time', () => {
//     const initialState = convertPackets([subscribePacket, OkPacket]);
//     expect(initialState.notifications.XT3412).toBe(true);
//     expect(initialState.XT3412).toBe(undefined);

//     signalQualityNotifications.forEach((notification) => {
//         expect(convertPackets([notification.packet], initialState).XT3412).toBe(
//             notification.result
//         );
//     });
// });
