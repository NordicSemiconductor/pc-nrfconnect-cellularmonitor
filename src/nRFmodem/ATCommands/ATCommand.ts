// eslint-disable-next-line @typescript-eslint/ban-types
const hereDoc = (func: Function) => {
    let s = func.toString();
    s = s.substr(s.indexOf('/*!') + 3);
    return s.substr(0, s.indexOf('*/')).trim();
};

export default class ATCommand {
    command: string;

    manual: { main: string; set: string; read: string; test: string };

    set() {
        /*! The set command is not supported. */
        throw new Error(
            `The set command for ${this.command} is not supported.`
        );
    }

    read() {
        /*! The read command is not supported. */
        throw new Error(
            `The read command for ${this.command} is not supported.`
        );
    }

    test() {
        /*! The test command is not supported. */
        throw new Error(
            `The test command for ${this.command} is not supported.`
        );
    }

    constructor(command: string) {
        this.command = command;
        this.manual = {
            main: hereDoc(this.constructor),
            set: hereDoc(this.set),
            read: hereDoc(this.read),
            test: hereDoc(this.test),
        };
    }
}
