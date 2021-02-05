export function charCode(str: string): number {
    return str.charCodeAt(0);
}

export const CharCodes = {
    EOL: '\n',
    LF: 13,
    BACKSPACE: 127,
    ARROW_KEY: 27,
    CTRL_C: 3,
    ESCAPE: 27,
};

export function isMac() {
    return window.navigator.platform.startsWith('Mac');
}

export function isWindows() {
    return window.navigator.platform.startsWith('Win');
}

export function isLinux() {
    return window.navigator.platform.startsWith('Linux');
}

export function stripAnsiCodes(str: string): string {
    // eslint-disable-next-line
    const regex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return str.replace(regex, '');
}
