/**
 * This file offers generic functions to perform select operations on MongoDB 
 * and Redis databases depending on the query. 
 * 
 * @author Sanket Sarang <sanket@blobcity.com>
 */

import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT } from '../../urls.js';
import { passwordStrength } from 'check-password-strength'
import { validateSt } from '../../utils.js';

export const login = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (username == null || username == '') {
        res.status(400).send('ER704,username');
        return;
    }

    if (password == null || password == '') {
        res.status(400).send('ER704,password');
        return;
    }

    let passHash = createHash('md5').update(password).digest('hex');

    try {
        let adminUsers = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'AdminUsers',
            condition: {
                username: username,
                passHash: passHash
            }
        })

        if(adminUsers.length == 0) {
            res.status(401).send('ER402');
            return;
        }

        if(adminUsers[0].passHash != passHash) return res.status(401).send('ER402');

        let st = makeid(64);
        let stHash = createHash('md5').update(st).digest('hex');
        let adminUser = adminUsers[0];
        const validUntil = Date.now() + 24 * 60 * 60 * 1000;

        //Insert session token into Redis
        await post(SCM_DB_INSERT, {
            db: 'redis',
            table: 'AdminSessions',
            rows: [
                {
                    key: stHash,
                    value: {
                        aid: adminUser.aid,
                        createdAt: Date.now(),
                        validUntil: validUntil
                    }
                }
            ]
        })

        res.json({ st:  st, validUntil: validUntil});
    } catch (err) {
        console.log(err);
        res.status(500).send('ER500');
    }
}

export const firstRegister = async(req, res) => {
    // Uncomment to reset the admin table. Deletes all users
    // await post(SCM_DB_DELETE, {
    //     db: 'mongo',
    //     table: 'AdminUsers'
    // })

    let adminUsers = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers'
    })

    if(adminUsers.length != 0) {
        res.status(400).send('ER406');
        return;
    }

    let username = req.body.username;
    let password = req.body.password;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let phone = req.body.phone;
    let email = req.body.email;

    //run basic validation checks
    if(username == null || username == '') {
        res.status(400).send('ER704,username');
        return;
    } else if(password == null || password == '') {
        res.status(400).send('ER704,password');
        return;
    } else if(first_name == null || first_name == '') {
        res.status(400).send('ER704,first_name');
        return;
    }

    if(passwordStrength(password).id <= 1) {
        res.status(400).send('ER708');
        return;
    }

    let passHash = createHash('md5').update(password).digest('hex');

    await post(SCM_DB_INSERT, {
        db: 'mongo',
        table: 'AdminUsers',
        rows: [
            {
                aid: makeid(36),
                username: username,
                passHash: passHash,
                first_name: first_name,
                last_name: last_name || '',
                phone: phone || '',
                email: email || ''
            }
        ]
    })

    res.send();
}

export const register = async(req, res) => {
    let aid = await validateSt(req.headers['authorization'])
    if(aid == null) return res.status(401).send('ER401');

    let username = req.body.username;
    let password = makeid(10);
    let role = req.body.role;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let phone = req.body.phone;
    let email = req.body.email;

    let passHash = createHash('md5').update(password).digest('hex');

    if(username == null || username == '') return res.status(400).send('ER704,username');
    else if(role == null || role == '') return res.status(400).send('ER704,role');
    else if(first_name == null || first_name == '') return res.status(400).send('ER704,first_name');

    switch(role) {
        case 'user':
        case 'admin':
        case 'superadmin':
            break;
        default:
            return res.status(400).send('ER709');
    }

    //check that a user with the same username is not already registered
    let registeredUsers = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            username: username
        }
    })

    if(registeredUsers.length != 0) return res.status(400).send('ER710');

    await post(SCM_DB_INSERT, {
        db: 'mongo',
        table: 'AdminUsers',
        rows: [
            {
                aid: makeid(36),
                username: username,
                passHash: passHash,
                role: role,
                first_name: first_name,
                last_name : last_name || '',
                phone: phone || '',
                email: email || ''
            }
        ]
    })

    res.json({registered: true,password: password});
}

/**
 * Gets the activation status of the admin panel. Used to check if the superadmin account is setup, 
 * and wether the same can be used for login. If not, then the firstRegister function must be used
 * first to register a super admin account.
 * @param {} req 
 * @param {*} res 
 */
export const activationStatus = async(req, res) => {
    let adminUsers = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers'
    })

    if(adminUsers.length != 0) res.json({activated: true});
    else res.json({activated: false});
}

// export const validateOtp = async (req, res) => {
//     let token = req.body.token;
//     let otp = req.body.otp;

//     if (token == null || token == '' || otp == null || otp == '') {
//         res.status(500).send('ER500');
//         return;
//     }

//     try {
//         let otpHash = createHash('md5').update(otp).digest('hex');

//         let riderOtpRecords = await post(SCM_DB_FETCH, {
//             db: 'redis',
//             table: 'RiderOtp',
//             id: token
//         })

//         //if length is 0, then token + otp combination is invalid
//         if (riderOtpRecords.length == 0) {
//             res.status(401).send('ER402');
//             return;
//         }

//         let riderOtp = riderOtpRecords[0];

//         //validate OTP to be correct.
//         if(riderOtp.otpHash != otpHash) {
//             res.status(401).send('ER402');
//             return;
//         }

//         let st = makeid(64);
//         let stHash = createHash('md5').update(st).digest('hex');
        
//         let mobHash = riderOtp.mobHash;


//         //Load rider details
//         let riderArr = await post(SCM_DB_FETCH, {
//             db: 'mongo',
//             table: 'Riders',
//             condition: {
//                 mobHash: mobHash
//             }
//         })

//         let rider;

//         /**
//          * Register a new rider and create an rid if no rider found corresponding to the login session.
//          */
//         if (riderArr.length == 0) {
//             rider = createNewRiderObject();
//             rider.mobHash = mobHash;
//             rider.country_code = riderOtp.country_code;
//             rider.mobile = riderOtp.mobile;
//             await post(SCM_DB_INSERT, {
//                 db: 'mongo',
//                 table: 'Riders',
//                 rows: [
//                     rider
//                 ]
//             })
//         } else rider = riderArr[0];

//         // Add entry in Redis.RiderSession
//         await post(SCM_DB_INSERT, {
//             db: 'redis',
//             table: 'RiderSession',
//             rows: [
//                 {
//                     key: stHash,
//                     value: {
//                         stHash: stHash,
//                         rid: rider.rid,
//                         createdAt: Date.now(),
//                         expiresAt: Date.now() + 24 * 60 * 60 * 1000 //24 hrs
//                     }
//                 }
//             ]
//         })

//         //return session token, along with key information of the rider that just did a successful login
//         res.json({
//             st: st,
//             rider: {
//                 mobile: rider.mobile,
//                 first_name: rider.first_name,
//                 last_name: rider.last_name,
//                 photo: rider.photo,
//                 vehicle_type: rider.vehicle_type,
//                 is_electric: rider.is_electric,
//                 fueled_propulsion: rider.fueled_propulsion,
//                 vehicle_no: rider.vehicle_no,
//                 kyc_approved: rider.kyc_approved,
//                 kyc_error_message: rider.kyc_error_message,
//                 createdAt: rider.createdAt // use for displaying "Members Since" on the app. 
//             }
//         });

//         //TODO: Drop the RiderOtp record
//         post(SCM_DB_DELETE, {
//             db: 'redis',
//             table: 'RiderOtp',
//             id: token
//         })
//     } catch (err) {
//         console.log(err);
//         res.status(500).send('ER500');
//     }
// }

// const createNewRiderObject = () => {
//     return {
//         rid: makeid(16),
//         first_name: '',
//         last_name: '',
//         country_code: '',
//         mobile: '',
//         mobHash: '',
//         address_line1: '',
//         address_line2: '',
//         flat_no: '',
//         zipcode: '',
//         city: '',
//         district: '',
//         aadhar_no: '',
//         photo_id_type: '',
//         photo_id_front: '',
//         photo_id_back: '',
//         utility_bill: '',
//         photo: '',
//         drivers_license_front: '',
//         driver_license_back: '',
//         drivers_license_expiry: '',
//         pan_no: '',
//         pan_copy: '',
//         vehicle_no: '',
//         rc_copy_front: '',
//         rc_copy_back: '',
//         vehicle_type: '',
//         is_electric: '',
//         fueled_propulsion: '',
//         bank_ac: '',
//         bank_ifsc: '',
//         bank_ac_name: '',
//         cancelled_cheque: '',
//         kyc_approved: '',
//         kyc_error_message: '',
//         kyc_approvedAt: 0,
//         kyc_approvedBy: '',
//         createdAt: Date.now(),
//         updatedAt: Date.now()
//     }
// }

//user2: MFh8NsvJx6