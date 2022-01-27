/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TAction } from '../../thunk';
import { getData, setData, setRenderedHtml } from './powerEstimationSlice';

export const OPE_URL =
    'https://devzone.nordicsemi.com/power/w/opp/3/online-power-profiler-for-lte';
export const CHART_URL =
    'https://support.nordicsemi.com/profiler/content/?prot=lte';
const SETTINGS_URL = 'https://support.nordicsemi.com/profiler/form/?prot=lte';

export type OnlinePowerEstimatorParams = {
    cdrx_inactive_timer?: string;
    cdrx_int?: string;
    cdrx_len?: string;
    cdrx_on_duration?: string;
    chip?: '4' | '5';
    config_lte_edrx_req_value?: string;
    config_lte_psm_req_rat?: string;
    config_lte_psm_req_rptau?: string;
    data_en?: 'off' | 'u1' | 'd1';
    data_int?: string;
    data_size?: string;
    drx_idle?: string;
    drx_sync?: string;
    gps_en?: 'off' | 'fixed' | 'continuous';
    gps_fix_time?: string;
    gps_interval?: string;
    idrx_en?: 'on';
    idrx_int?: string;
    idrx_len?: string;
    idrx_nb_sync?: string;
    idrx_reps?: '1' | '2' | '4' | '8' | '16' | '32' | '64' | '128' | '256';
    idrx_sync?: string;
    lte_type?: 'm1' | 'nb';
    psm?: 'False' | 'on';
    psm_int?: string;
    sim_sleep?: string;
    sim_sleep_enable?: 'on' | 'True';
    software?: string;
    tx_power?: '0' | '10' | '23';
    tx_power_nb?: string;
    voltage?: string;
};

const createFormData = (params: OnlinePowerEstimatorParams) => {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
        // if this value is 0 the backend crashes
        if (key === 'cdrx_int' && value === '0') {
            return;
        }
        formData.append(key, value);
    });
    return formData;
};

const getHtml = async (body: FormData, url: string) => {
    const data = await fetch(url, {
        method: 'post',
        body,
    });
    return data.text();
};

export const postForm = async (params: OnlinePowerEstimatorParams) => {
    const formData = createFormData(params);
    const chartHtml = await getHtml(formData, CHART_URL);
    const settingsHtml = await getHtml(formData, SETTINGS_URL);
    return settingsHtml + chartHtml;
};

export const updatePowerData =
    (key: keyof OnlinePowerEstimatorParams, value: string): TAction =>
    async (dispatch, getState) => {
        console.log('key', key);
        console.log('value', value);
        console.log('state', getState());
        const data = getData(getState());
        console.log('data before', data);
        if (!data) return;
        const updatedData = {
            ...data,
            [key]: value,
        };
        dispatch(setData(updatedData));
        console.log('data after', updatedData);
        const updatedHtml = await postForm(updatedData);
        dispatch(setRenderedHtml(updatedHtml));
    };
