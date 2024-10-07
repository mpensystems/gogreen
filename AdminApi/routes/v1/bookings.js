/**
 * Functions to create and manage bookings. This layer acts as a data pre-processing before
 * passing on critical transactional operations to the SCM to handle.
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */


import { createHash } from 'crypto';
import { makeid, validateAdminRole } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { passwordStrength } from 'check-password-strength'
import { getAdminUserFromSt, validateSuperadminRole, validateUserRole } from '../../utils.js';
import {latLngToCell} from "h3-js";
import { getSysConfig, getCompensationConfig } from '../../controllers/config.js';
import axios from 'axios';


export const createBooking = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    const x = req.body;
    const sysconfig = await getSysConfig();
    const bidRules = sysconfig.bidding_rules;
    const defaultBidConfig = sysconfig.default_bid_config;
    const compensationRules = await getCompensationConfig();

    let booking = await createBookingObject(x, bidRules, compensationRules);

    //validate that all required fields are present
    if(booking.pickup_address1 == '') return res.status(400).send('ER704,pickup_address1');
    if(booking.drop_address1 == '') return res.status(400).send('ER704,drop_address1');
    if(booking.pickup_city == '') return res.status(400).send('ER704,pickup_city');
    if(booking.drop_city == '') return res.status(400).send('ER704,drop_city');
    if(booking.pickup_zip == '') return res.status(400).send('ER704,pickup_zip');
    if(booking.drop_zip == '') return res.status(400).send('ER704,drop_zip');
    if(booking.pickup_name == '') return res.status(400).send('ER704,pickup_name');
    if(booking.pickup_mobile == '') return res.status(400).send('ER704,pickup_mobile');
    if(booking.drop_name == '') return res.status(400).send('ER704,drop_name');
    if(booking.drop_mobile == '') return res.status(400).send('ER704,drop_mobile');

    //validate trip distance and time are within rule limits
    if(booking.trip_distance / 1000 > bidRules.max_trip_distance_kms) res.status(400).send(`ER213,${booking.trip_distance/1000},${bidRules.max_trip_distance_kms}`);
    if(booking.trip_time > bidRules.max_trip_time_mins) res.status(400).send(`ER214,${booking.trip_time},${bidRules.max_trip_time_mins}`);

    //set the specified bid config on the booking
    if(x.bidConfig != null) {
        let configError = isBidConfigValid(x.bidConfig, bidRules, compensationRules, booking);
        if(configError != null) return res.status(400).send(configError);
        applyBidConfig(booking, x.bidConfig);
    } else { //set a default bid config on the booking
        applyBidConfig(booking, defaultBidConfig);
    }

    res.json(booking);
}

const createBookingObject = (x, bidRules, compensationRules) => new Promise(async resolve => {
    let booking = {
        bid: makeid(36),
        pickup_address1: x.pickup_address1 || '',
        pickup_address2: x.pickup_address2 || '',
        pickup_house: x.pickup_house || '',
        pickup_landmark: x.pickup_landmark || '',
        pickup_zip: x.pickup_zip || '',
        pickup_city: x.pickup_city || '',
        pickup_state: x.pickup_state || '',
        pickup_district: x.pickup_district || '',
        pickup_mobile: x.pickup_mobile || '',
        pickup_name: x.pickup_name || '',

        drop_address1: x.drop_address1 || '',
        drop_address2: x.drop_address2 || '',
        drop_house: x.drop_house || '',
        drop_landmark: x.drop_landmark || '',
        drop_zip: x.drop_zip || '',
        drop_city: x.drop_city || '',
        drop_state: x.drop_state || '',
        drop_district: x.drop_district || '',
        drop_mobile: x.drop_mobile || '',
        drop_name: x.drop_name || '',
        
        channel: x.channel || 'admin-created',
        orderId: x.orderId || '',
        status: 'active',
        rid:'',
        tids: [],
        created_at: Date.now()
    }

    //process further only if all required fields are present
    if(booking.pickup_address1 == '' 
        || booking.drop_address1 == ''
        ||booking.pickup_city == ''
        ||booking.drop_city == ''
        ||booking.pickup_zip == ''
        ||booking.drop_zip == ''
        ||booking.pickup_name == ''
        |booking.pickup_mobile == ''
        ||booking.drop_name == ''
        ||booking.drop_mobile == '') {
            resolve(booking);
    }

    if(x.pickup_geo == null || x.pickup_geo.lat == null || x.pickup_geo.lng == null || x.pickup_geo.lat == 0.0 || x.pickup_geo.lng == 0.0) {
        let combinedAddress = `${booking.pickup_address1} ${booking.pickup_address2} ${booking.pickup_landmark} ${booking.pickup_district} ${booking.pickup_city} ${booking.pickup_state} ${booking.pickup_zip}`;
        booking.pickup_geo = await geocodeAddress(encodeURIComponent(combinedAddress));
    } else  {
        booking.pickup_geo = {
            lat: x.pickup_geo.lat,
            lng: x.pickup_geo.lng
        }
    }

    if(x.drop_geo == null|| x.drop_geo.lat == null || x.drop_geo.lng == null || x.drop_geo.lat == 0.0 || x.drop_geo.lng == 0.0) {
        let combinedAddress = `${booking.drop_address1} ${booking.drop_address2} ${booking.drop_landmark} ${booking.drop_district} ${booking.drop_city} ${booking.drop_state} ${booking.drop_zip}`;
        booking.drop_geo = await geocodeAddress(encodeURIComponent(combinedAddress));
    } else  {
        booking.drop_geo = {
            lat: x.drop_geo.lat,
            lng: x.drop_geo.lng
        }
    }

    //compute pickup h3 index based on the pickup_geo
    booking.pickup_h3i = latLngToCell(booking.pickup_geo.lat, booking.pickup_geo.lng, 9);

    //computer drop h3 index based on the drop_geo
    booking.drop_h3i = latLngToCell(booking.drop_geo.lat, booking.drop_geo.lng, 9);

    const distAndTime = await computeTripDistanceAndTime(booking.pickup_geo, booking.drop_geo);

    //compute distance and time between pickup_geo and drop_geo
    booking.trip_distance = distAndTime.dist;
    booking.trip_time = distAndTime.time;

    resolve(booking);
})

const geocodeAddress = (address) => new Promise(async (resolve) => {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    .then(response => {
        let result = response.data;
        if(result == null || result.results == null || result.results.length == 0) return resolve({lat: 0.00, lng: 0.00});
        result = result.results[0];
        resolve({lat: result.geometry.location.lat, lng: result.geometry.location.lng});
    }). catch(err => {
        console.error('Error in geocoding address', err);
        resolve({lat: 0.00, lng: 0.00});
    })
})

const computeTripDistanceAndTime = (pickup, drop) => new Promise(async resolve => {
    let encodedPickupStr = encodeURIComponent(`${pickup.lat},${pickup.lng}`);
    let encodedDropStr = encodeURIComponent(`${drop.lat},${drop.lng}`);
    axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodedDropStr}&origins=${encodedPickupStr}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    .then(response => {
        let result = response.data;
        if(result == null || result.rows == null || result.rows.length == 0) return resolve({dist: 5000, time: 20}); //smart default value of 5000 meters and 20 mins.
        let elements = result.rows[0].elements;
        if(elements == null || elements.length == 0) return resolve({dist: 5000, time: 20});
        let element = elements[0];
        resolve({dist: element.distance.value, time: Math.round(element.duration.value / 60)}); //convert time from seconds to minutes
    }). catch(err => {
        console.error('Error in computing trip distance and time', err);
        resolve({dist: 5000, time: 20});
    })
})

/**
 * 
 * Checks for basic rules of bid config against acceptable parameters
 * @returns null if all rules are satisified, else the error string to report as error.
 */
const isBidConfigValid = (bc, bidRules, compensationRules, booking) => {
    if(bc.min_bid == null) return 'ER704,bidConfig.min_bid';
    if(bc.max_bid == null) return 'ER704,bidConfig.max_bid';
    if(bc.steps == null) return 'ER704,bidConfig.steps';
    if(bc.step_period == null) return 'ER704,bidConfig.step_period';
    if(bc.dist_increment == null) return 'ER704,bidConfig.dist_increment';

    if(bc.min_bid < bidRules.min_bid) return 'ER704,bidConfig.min_bid MIN VALUE BREACH';
    if(bc.max_bid > bidRules.max_bid) return 'ER704,bidConfig.max_bid MAX VALUE BREACH';
    if(bc.max_bid < bc.min_bid) return 'ER704,bidConfig.max_bid LESS THAN min_bid';
    if(bc.steps > bidRules.max_stes) return 'ER704,bidConfig.steps MAX VALUE BREACH';
    if(bc.steps < 0) return 'ER704,bidConfig.steps LESS THAN 0';
    if(bc.step_period < bidRules.min_step_period) return 'ER704,bidConfig.step_period MIN VALUE BREACH';
    if(bc.step_period > bidRules.max_step_period) return 'ER704,bidConfig.step_period MAX VALUE BREACH';
    
    if(bc.start_dist < 0) return 'ER704,bidConfig.start_dist LESS THAN 0';
    if(bc.start_dist > bidRules.max_search_dist) return 'ER704,bidConfig.start_dist MAX VALUE BREACH';
    if(bc.dist_increment <= 0) return 'ER704,bidConfig.dist_increment LESS THAN OR EQ 0';
    if(bc.start_dist + bc.dist_increment * bc.steps > bidRules.max_search_dist) return 'ER704,bidConfig.start_dist MAX VALUE BREACH';
    
    return null;
}

const applyBidConfig = (booking, bidConfig) => {
    booking.bidConfig = {
        bid: booking.bid,
        min_bid: bidConfig.min_bid,
        max_bid: bidConfig.max_bid,
        current_bid: bidConfig.min_bid,
        steps: bidConfig.steps,
        step_period: bidConfig.step_period,
        dist_increment: bidConfig.dist_increment,
        start_dist: bidConfig.start_dist,
        current_step: 1,
        current_dist: bidConfig.start_dist,
        status: 'active',
        h3is: [],
        started_at: Date.now(),
        updated_at: Date.now(),
        ended_at: 0
    }
}