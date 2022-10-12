// import { initialViewModel, Packet, ViewModel } from '../state';
// import { convert } from './index';

// const encoder = new TextEncoder();
// const encode = (txt: string) => Buffer.from(encoder.encode(txt));
// const atPacket = (txt: string): Packet => ({
//     format: 'at',
//     packet_data: encode(txt),
// });

// const OkPacket = atPacket('OK\r\n');
// const ErrorPacket = atPacket('ERROR\r\n');

// const setCommandPackets = [
//     { setCommand: atPacket('AT+CEMODE=0'), response: OkPacket },
//     { setCommand: atPacket('AT+CEMODE=1'), response: ErrorPacket },
//     { setCommand: atPacket('AT+CEMODE=2'), response: OkPacket },
//     { setCommand: atPacket('AT+CEMODE=3'), response: ErrorPacket },
// ];

// const readCommandPackets = [
//     {
//         readCommand: atPacket('AT+CEMODE?'),
//         response: atPacket('+CEMODE: 0\r\nOK\r\n'),
//     },
//     {
//         readCommand: atPacket('AT+CEMODE?'),
//         response: atPacket('+CEMODE: 2\r\nOK\r\n'),
//     },
// ];

// const testCommandPackets = [
//     {
//         testCommand: atPacket('AT+CEMODE=?'),
//         response: atPacket('+CEMODE: (0,2)\r\nOK\r\n'),
//     },
//     { testCommand: atPacket('AT+CEMODE=?'), response: ErrorPacket },
// ];

// const convertPackets = (
//     packets: Packet[],
//     previousState = initialViewModel()
// ): ViewModel =>
//     packets.reduce(
//         (state, packet) => ({ ...state, ...convert(packet, state) }),
//         previousState
//     );

// test('+CEMODE set commands', () => {
//     // TODO: Check if +CEMODE should update anything in the viewModel
//     // For now, leave the viewModel alone

//     setCommandPackets.forEach((packets) => {
//         const setCommandSent = convertPackets([packets.setCommand]);
//         expect(setCommandSent.waitingAT).toBe('+cemode');
//         expect(
//             convertPackets([packets.response], setCommandSent).waitingAT
//         ).toBe(null);
//     });
// });

// test('+CEMODE read commands', () => {
//     // TODO: Check if +CEMODE should update anything in the viewModel
//     // For now, leave the viewModel alone

//     readCommandPackets.forEach((packets) => {
//         const setCommandSent = convertPackets([packets.readCommand]);
//         expect(setCommandSent.waitingAT).toBe('+cemode');
//         expect(
//             convertPackets([packets.response], setCommandSent).waitingAT
//         ).toBe(null);
//     });
// });

// test('+CEMODE test commands', () => {
//     // TODO: Check if +CEMODE should update anything in the viewModel
//     // For now, leave the viewModel alone

//     testCommandPackets.forEach((packets) => {
//         const setCommandSent = convertPackets([packets.testCommand]);
//         expect(setCommandSent.waitingAT).toBe('+cemode');
//         expect(
//             convertPackets([packets.response], setCommandSent).waitingAT
//         ).toBe(null);
//     });
// });
