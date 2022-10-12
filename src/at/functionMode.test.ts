import { Packet,  } from "../state";
import { FunctionViewModel } from "./functionMode";
import { convert, State } from "./index";

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
  format: "at",
  packet_data: encode(txt),
});

const cfunQuestion = atPacket("AT+CFUN");

const cfunPacketReady = atPacket("+CFUN: READY\r\nOK\r\n");

const cfunPacketError = atPacket("ERROR\r\n");

const convertPackets = (...packets: Packet[]): State => {
  return packets.reduce(
  (state, packet) => ({ ...state, ...convert(packet, state) }),
  <State>{ pinState: 'unknown' }
);}


test("+CFUN event set the pin status correctly", () => {
  const model = convertPackets(cfunPacketReady);
  expect(model.pinState).toBe("ready");
});

test("+CFUN event with error will set pin status accordingly", () => {
  const model = convertPackets(cfunQuestion, cfunPacketError);
  expect(model.pinState).toBe("error");
});

