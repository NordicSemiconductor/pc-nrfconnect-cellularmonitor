/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from 'pc-nrfconnect-shared';

import { TAction, TDispatch } from '../../thunk';
import {
    getData,
    setData,
    setHasError,
    setIsLoading,
    setRenderedHtml,
} from './powerEstimationSlice';

export const OPE_URL =
    'https://devzone.nordicsemi.com/power/w/opp/3/online-power-profiler-for-lte';
export const CHART_URL =
    'https://support.nordicsemi.com/profiler/content/?prot=lte';
const SETTINGS_URL = 'https://support.nordicsemi.com/profiler/form/?prot=lte';

export const OPP_KEYS = [
    'cdrx_inactive_timer',
    'cdrx_int',
    'cdrx_len',
    'cdrx_on_duration',
    'chip',
    'config_lte_edrx_req_value',
    'config_lte_psm_req_rat',
    'config_lte_psm_req_rptau',
    'data_en',
    'data_int',
    'data_size',
    'drx_idle',
    'drx_sync',
    'gps_en',
    'gps_fix_time',
    'gps_interval',
    'idrx_en',
    'idrx_int',
    'idrx_len',
    'idrx_nb_sync',
    'idrx_reps',
    'idrx_sync',
    'lte_type',
    'psm',
    'psm_int',
    'sim_sleep',
    'sim_sleep_enable',
    'software',
    'tx_power',
    'tx_power_nb',
    'voltage',
] as const;

export type OnlinePowerEstimatorParams = {
    [K in typeof OPP_KEYS[number]]?: string;
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

export const postForm = async (
    params: OnlinePowerEstimatorParams,
    dispatch: TDispatch
) => {
    dispatch(setIsLoading(true));
    let html = null;
    try {
        const formData = createFormData(params);
        const chartHtml = await getHtml(formData, CHART_URL);
        const settingsHtml = await getHtml(formData, SETTINGS_URL);
        html = settingsHtml + chartHtml;
    } catch (err) {
        logger.error(
            `Request to ${CHART_URL} failed. Check network connection.`
        );
        dispatch(setHasError(true));
    }
    dispatch(setIsLoading(false));
    return html;
};

export const updatePowerData =
    (key: keyof OnlinePowerEstimatorParams, value: string): TAction =>
    async (dispatch, getState) => {
        const data = getData(getState());

        if (!data) return;
        if (data[key] === value) return;
        const updatedData = {
            ...data,
            [key]: value,
        };
        dispatch(setData(updatedData));
        const updatedHtml = await postForm(updatedData, dispatch);
        if (updatedHtml) dispatch(setRenderedHtml(updatedHtml));
    };
