import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';

export interface HoverMetadata {
    match: RegExp;
    title: string;
    body: string;
}

export default class HoverAddon extends NrfTerminalAddon {
    name = 'HoverAddon';

    hoverMetadata: HoverMetadata[];

    constructor(
        commander: NrfTerminalCommander,
        hoverMetadata: HoverMetadata[]
    ) {
        super(commander);
        this.hoverMetadata = hoverMetadata;
    }

    protected onActivate(): void {
        const r = new RegExp('I will match');

        this.terminal.registerLinkMatcher(r, (/* e, uri */) => {
            console.log('You clicked on the special matching phrase');
        });
    }
}
