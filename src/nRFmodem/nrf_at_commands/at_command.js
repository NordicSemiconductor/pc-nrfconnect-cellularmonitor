const hereDoc = f => {
    let s = f.toString();
    s = s.substr(s.indexOf('/*!') + 3);
    return s.substr(0, s.indexOf('*/')).trim();
};

class ATCommand {
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
    constructor(command = null) {
        this.command = command;
        this.manual = {
            main: hereDoc(this.constructor),
            set: hereDoc(this.set),
            read: hereDoc(this.read),
            test: hereDoc(this.test),
        };
    }
}

module.exports = {
    ATCommand,
};
