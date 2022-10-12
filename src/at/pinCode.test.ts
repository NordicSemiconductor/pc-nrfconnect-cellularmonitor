// import { initialViewModel, Packet, ViewModel } from '../state';
// import { convert } from './pinCode';

// const encoder = new TextEncoder();
// const encode = (txt: string) => Buffer.from(encoder.encode(txt));
// const atPacket = (txt: string): Packet => ({
//     format: 'at',
//     packet_data: encode(txt),
// });

// const cpinQuestion = atPacket('AT+CPIN');

// const cpinPacketReady = atPacket('+CPIN: READY\r\nOK\r\n');

// const cpinPacketError = atPacket('ERROR\r\n');

// const convertPackets = (...packets: Packet[]): ViewModel =>
//     packets.reduce(
//         (state, packet) => ({ ...state, ...convert(packet, state) }),
//         initialViewModel()
//     );

// describe('AT CPIN test suite', () => {
//     it('waitingAT is set to the latest AT command', () => {
//         expect(convertPackets(cpinQuestion).waitingAT).toBe('+cpin');
//     });

//     it('waitingAT is cleared after OK', () => {
//         const model = convertPackets(cpinQuestion, cpinPacketReady);
//         expect(model.waitingAT).toBeNull();
//     });

//     it('waitingAT is cleared after ERROR', () => {
//         const model = convertPackets(cpinQuestion, cpinPacketError);
//         expect(model.waitingAT).toBeNull();
//     });

//     it('+CPIN event set the pin status correctly', () => {
//         const model = convertPackets(cpinPacketReady);
//         expect(model.pinState).toBe('ready');
//     });

//     it('+CPIN event with error will set pin status accordingly', () => {
//         const model = convertPackets(cpinQuestion, cpinPacketError);
//         expect(model.pinState).toBe('error');
//     });

//     it('+CPIN event with error will set pin status accordingly', () => {
//         const model = convertPackets(cpinPacketError);
//         expect(model.pinState).toBe('unknown');
//     });
// });
