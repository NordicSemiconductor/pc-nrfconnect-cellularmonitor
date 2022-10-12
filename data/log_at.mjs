import { writeFileSync, readFile } from 'fs';

readFile('./data/trace.json', (err, data) => {
    const d = JSON.parse(data);
    d.forEach((packet) => {
        if (packet.format === 'at') {
            const buffer = Buffer.from(packet.packet_data.data);
            writeFileSync('./data/at_commands.txt', buffer.toString() + '\n', {
                flag: 'a',
                encoding: 'utf-8',
            });
            console.log(buffer.toString());
        }
    });
});
