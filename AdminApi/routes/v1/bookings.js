import { createHash } from 'crypto';
import { makeid, validateAdminRole } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { passwordStrength } from 'check-password-strength'
import { getAdminUserFromSt, validateSuperadminRole, validateUserRole } from '../../utils.js';
import {latLngToCell} from "h3-js";
import axios from 'axios';


export const createBooking = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let booking = await createBookingObject(req.body);

    res.json(booking);
}

const createBookingObject = (x) => new Promise(async resolve => {
    let booking = {
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

    //compute distance and time between pickup_geo and drop_geo
    booking.trip_distance = 0;
    booking.trip_time = 0;    

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