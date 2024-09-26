/**
 * Utility functions that are used by several different functions within the application
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import {post} from './api.js';
import { SCM_DB_FETCH } from './urls.js';
import {createHash} from 'crypto';

/**
 * Function to check if session token is valid.
 * @param {*} bearer the bearer session token received in Authorization header
 * @returns rid if the session token is valid, else null
 */
export const validateSt = (bearer) => new Promise( async (resolve) => {
    let st = bearer.replace('Bearer ', '');
    let stHash = createHash('md5').update(st).digest('hex');
    api.post(URLS.SCM_DB_FETCH, {
        db: 'redis',
        table: 'RiderSession',
        q: {
            stHash: stHash
        }
    }).then(result => {
        if(result.length == 1) resolve(result[0].rid);
        else resolve(null);
    }).catch(err => resolve(null));
})

export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}