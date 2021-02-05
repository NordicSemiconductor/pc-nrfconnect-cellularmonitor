/* eslint-disable max-classes-per-file */

/* General
 *
 * The general commands are for the identification of the device.
 */

import ATCommand from './ATCommand';

// 4.1
export class AT_CGMI extends ATCommand {
    constructor() {
        super('+CGMI');
    }
    set() {
        return {
            command: this.command,
            parser(input: string) {
                return input;
            },
        };
    }
}

// 4.2
export class AT_CGMM extends ATCommand {
    constructor() {
        super('+CGMM');
    }
    set() {
        return {
            command: this.command,
            parser(input: string) {
                return input;
            },
        };
    }
}

// 4.3
export class AT_CGMR extends ATCommand {
    constructor() {
        super('+CGMR');
    }
    set() {
        return {
            command: this.command,
            parser(input: string) {
                return input;
            },
        };
    }
}

// 4.4
export class AT_CGSN extends ATCommand {
    constructor() {
        super('+CGSN');
    }

    set(snt = 0) {
        const id = ['sn', 'imei', 'imeisv', 'svn'][snt];
        return {
            command: `AT${this.command}=${snt}`,
            parser(input: string) {
                const match = /\+CGSN: "(?<id>.*?)"/.exec(input)?.[0];
                return {
                    [id]: match?.id,
                };
            },
        };
    }

    test() {
        return {
            command: `AT${this.command}=?`,
            parser(input: string) {
                const match = /\+CGSN: "(?<id_list>.*?)"/.exec(input)?.[0];
                return {
                    id_list: match?.id_list,
                };
            },
        };
    }
}

// 4.5
export class AT_CIMI extends ATCommand {
    constructor() {
        super('+CIMI');
    }
    set() {
        return {
            command: `AT${this.command}`,
            parser(input: string) {
                return input;
            },
        };
    }
}

// 4.6
export class AT_SHORTSWVER extends ATCommand {
    constructor() {
        super('%SHORTSWVER');
    }
    set() {
        return {
            command: `AT${this.command}`,
            parser(input: string) {
                return /%SHORTSWVER: (?<version_string>.*)/.exec(input)?.[0];
            },
        };
    }
}

// 4.7
export class AT_HWVERSION extends ATCommand {
    constructor() {
        super('%HWVERSION');
    }
    set() {
        return {
            command: `AT${this.command}`,
            parser(input: string) {
                return /%HWVERSION: (?<version_string>.*)/.exec(input)?.[0];
            },
        };
    }
}

// 4.8
export class AT_XMODEMUUID extends ATCommand {
    constructor() {
        super('%XMODEMUUID');
    }
    set() {
        return {
            commnad: `AT${this.command}`,
            parser(input: string) {
                return /%XMODEMUUID: (?<UUID>.*)/.exec(input)?.[0];
            },
        };
    }
}

// 4.9
export class AT_XICCID extends ATCommand {
    constructor() {
        super('%XICCID');
    }
    set() {
        return {
            command: `AT${this.command}`,
            parser(input: string) {
                return /%XICCID: (?<ICCID>.*)/.exec(input)?.[0];
            },
        };
    }
}

// 4.10
export class AT_ODIS extends ATCommand {
    constructor() {
        super('+ODIS');
    }
    set(HDID, HDMAN, HDMOD, HDSW) {
        return {
            command: `AT${this.command}="${HDID}","${HDMAN}","${HDMOD}","${HDSW}"`,
        };
    }
    read() {
        return {
            command: `AT${this.command}?`,
            parser(input: string) {
                return /\+ODIS: "(?<HDMAN>.*?)","(?<HDMOD>.*?)","(?<HDSW>.*?)"/.exec(
                    input
                )?.[0];
            },
        };
    }
}

// 4.11
export class AT_ODISNTF extends ATCommand {
    constructor() {
        super('+ODISNTF');
    }
    set(enable = 1) {
        return {
            command: `AT${this.command}=${enable}`,
            parser(input: string) {
                return /\+ODISNTF: "(?<HDID>.*?)","(?<HDMAN>.*?)","(?<HDMOD>.*?)","(?<HDSW>.*?)"/.exec(
                    input
                )?.[0];
            },
        };
    }
}
