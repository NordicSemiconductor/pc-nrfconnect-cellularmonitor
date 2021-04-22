const getPluginsDir = jest.fn();

export default { start: jest.fn().mockReturnValue(1), stop: jest.fn() };
export { getPluginsDir };
