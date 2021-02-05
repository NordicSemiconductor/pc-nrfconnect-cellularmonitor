import doc4 from './General.yaml';
import doc5 from './MobileTermination.yaml';

const doc = {
    ...doc4,
    ...doc5,
};

export default class ATCommand {
    command: string;
    doc: { description: string; set?: string; read?: string; test?: string };

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
        this.doc = doc[command];
    }
}
