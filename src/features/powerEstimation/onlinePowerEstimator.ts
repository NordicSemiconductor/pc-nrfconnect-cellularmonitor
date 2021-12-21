/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const OPE_URL =
    'https://devzone.nordicsemi.com/power/w/opp/3/online-power-profiler-for-lte';
export const CHART_URL =
    'https://support.nordicsemi.com/profiler/content/?prot=lte';

export type OnlinePowerEstimatorParams = {
    cdrx_inactive_timer?: string;
    cdrx_int?: string;
    cdrx_len?: string;
    cdrx_on_duration?: string;
    chip?: string;
    config_lte_edrx_req_value?: string;
    config_lte_psm_req_rat?: string;
    config_lte_psm_req_rptau?: string;
    data_en?: string;
    data_int?: string;
    data_size?: string;
    drx_idle?: string;
    drx_sync?: string;
    gps_en?: string;
    gps_fix_time?: string;
    gps_interval?: string;
    idrx_en?: string;
    idrx_int?: string;
    idrx_len?: string;
    idrx_nb_sync?: string;
    idrx_reps?: string;
    idrx_sync?: string;
    lte_type?: string;
    psm?: string;
    psm_int?: string;
    sim_sleep?: string;
    sim_sleep_enable?: string;
    software?: string;
    tx_power?: string;
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

export const postForm = (params: OnlinePowerEstimatorParams) => {
    return fetch(CHART_URL, {
        method: 'post',
        body: createFormData(params),
    })
        .then(data => data.text())
        .then(html => html)
        .catch(err => {
            throw new Error(err);
        });
};
