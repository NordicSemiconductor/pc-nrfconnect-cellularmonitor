/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const getPluginsDir = jest.fn().mockReturnValue('mocked_plugin_dir_path');

export default { start: jest.fn().mockReturnValue(1), stop: jest.fn() };
export { getPluginsDir };
