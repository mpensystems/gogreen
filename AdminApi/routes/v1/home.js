/**
 * API functions to fetch items for display on the home page
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { getAdminUserFromSt, validateSuperadminRole, validateAdminRole, validateUserRole } from '../../utils.js';
import { response } from 'express';

export const getHomePageStats = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    res.json({
        total_riders: getRandomInt(100),
        active_riders: getRandomInt(10),
        today_earnings: getRandomInt(25000),
        today_rider_earnings: getRandomInt(8000),
        today_bookings: getRandomInt(100),
        today_trips: getRandomInt(80),
        trips_inprogress: getRandomInt(15)
    })    
}

export const getActiveRiderLocations = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    //temporary code for testing. Eventually must pickup location data from Redis.RiderLoc table
    const lats = [19.097707,19.096240,19.081420,19.091472,19.049376,19.057814,19.071024,19.022729,18.966324,18.926456];
    const lngs = [72.893072,72.883711,72.918714,72.844917,72.871043,72.846356,72.864269,72.851590,72.832385,72.827410];

    let locations = [];
    for(var i = 0; i < getRandomInt(30); i++) {
        locations.push(`${lats[getRandomInt(lats.length)]},${lngs[getRandomInt(lngs.length)]}`);
    }

    res.json(locations);
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}