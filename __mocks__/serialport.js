export const parsers = {
    Readline: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
    })),
};

const Serialport = jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    emit: jest.fn(),
}));

export default Serialport;
