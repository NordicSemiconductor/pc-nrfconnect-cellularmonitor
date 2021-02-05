import TerminalCommander from './NrfTerminalCommander';
import { stripAnsiCodes } from './utils';

export default class Prompt {
    #template: string;
    #commander: TerminalCommander;

    constructor(commander: TerminalCommander, template: string) {
        this.#template = `\n\r${template} `;
        this.#commander = commander;
    }

    public get value() {
        return this.#template.replace(
            ':lineCount',
            this.#commander.lineCount.toString()
        );
    }

    public get length(): number {
        return stripAnsiCodes(this.value).length;
    }
}
