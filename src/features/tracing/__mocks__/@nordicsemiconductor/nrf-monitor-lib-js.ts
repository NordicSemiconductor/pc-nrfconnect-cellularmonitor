/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default {
    start: jest.fn().mockReturnValue(1),
    stop: jest.fn(),
};

const getPluginsDir = jest.fn().mockReturnValue('mocked_plugin_dir_path');

export { getPluginsDir };
