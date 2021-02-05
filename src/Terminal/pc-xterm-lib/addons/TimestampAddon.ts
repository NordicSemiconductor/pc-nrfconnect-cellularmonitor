import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import * as dateFns from 'date-fns';

import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';
import { charCode, CharCodes } from '../utils';

/**
 * Prints the date and time a command was executed at the
 * rightmost edge of the screen.
 *
 * The format of the displayed timestamp can be set by
 * passing an alternative string to the constructor, or
 * by changing the `format` property at any time. By default, the
 * format is `HH:mm:ss`.
 *
 * Timestamps can be toggled using the `toggleTimestamps` method,
 * or by using the `"toggle_timestamps"` command registered by
 * this addon.
 */
export default class TimestampAddon extends NrfTerminalAddon {
    name = 'TimestampAddon';

    #showTimestamps = true;

    /**
     * The `date-fns` compatible formatter used to format the timestamp.
     */
    format: string;

    constructor(commander: NrfTerminalCommander, format?: string) {
        super(commander);
        this.format = format || 'HH:mm:ss';
    }

    protected onActivate() {
        this.terminal.onData(data => {
            if (this.showingTimestamps && charCode(data) === CharCodes.LF) {
                this.writeTimestamp();
            }
        });
    }

    private writeTimestamp(): void {
        const now = new Date();
        const formatted = dateFns.format(now, this.format);

        const endCols =
            this.terminal.cols -
            this.commander.output.length -
            formatted.length -
            this.commander.prompt.length;

        this.terminal.write(ansi.cursorForward(endCols));
        this.terminal.write(c.bold(c.grey(formatted)));
    }

    /**
     * Whether or not timestamps will be shown on new commands.
     */
    public get showingTimestamps(): boolean {
        return this.#showTimestamps;
    }

    /**
     * Toggles the printing of timestamps on or off.
     * @returns {void}
     */
    public toggleTimestamps(): void {
        this.#showTimestamps = !this.showingTimestamps;
    }
}
