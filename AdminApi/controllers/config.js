/**
 * Utility functions to fetch configurations from the SCM module
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import {  get } from '../api.js';
import {  SYS_CONFIG, COMPENSATION_CONFIG } from '../urls.js';

export const getSysConfig = () => new Promise(async (resolve) => {
    let sysConfig = await get(SYS_CONFIG);
    resolve(sysConfig);
})

export const getCompensationConfig = () => new Promise(async (resolve) => {
    let compensationConfig = await get(COMPENSATION_CONFIG);
    resolve(compensationConfig);
})
