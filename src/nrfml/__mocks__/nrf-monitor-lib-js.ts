const getPluginsDir = jest.fn().mockReturnValue('mocked_plugin_dir_path');

export default { start: jest.fn().mockReturnValue(1), stop: jest.fn() };
export { getPluginsDir };
