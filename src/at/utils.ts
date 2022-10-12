export const getNumberList = (body?: string) => {
    const firstLine = body?.split('\r\n')[0];
    return (
        firstLine
            ?.trim()
            .split(',')
            .filter(item => item)
            .map(Number) ?? []
    );
};

export const getParametersFromResponse = (body?: string) => {
    if (!body) {
        return;
    }

    const lineSeparator = /(\r\n|\\r\\n)/;
    const trimmedBody = body?.startsWith(':') ? body?.replace(':', '') : body;
    const firstLine = trimmedBody?.split(lineSeparator)[0];
    const paramArray = firstLine
        .split(',')
        .map(stringValue => stringValue.trim())
        .map(value => {
            if (
                value.charAt(0) === '"' &&
                value.charAt(value.length - 1) === '"'
            ) {
                return value.substring(1, value.length - 1);
            }
            if (
                value.substring(0, 2) === '\\"' &&
                value.substring(value.length - 2) === '\\"'
            ) {
                return value.substring(2, value.length - 2);
            }
            return parseInt(value, 10);
        });

    return paramArray;
};
