import { createHash } from 'crypto';
import { makeid, validateAdminRole } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { passwordStrength } from 'check-password-strength'
import { getAdminUserFromSt, validateSuperadminRole, validateUserRole } from '../../utils.js';

export const listUsers = async(req, res) => {
    let adminUser = await validateAdminRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let adminUsers = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers'
    })

    if(adminUsers == null) return res.json([]);

    res.json(adminUsers.map(x => {
        delete x._id;
        delete x.passHash;
        return x;
    }))
}

export const getUserProfile = async(req, res) => {
    let adminUser = await validateUserRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let aid = req.params.aid;

    let users = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: aid
        }
    })

    if(users.length == 0) return res.status(400).send('ER704,aid');
    else if(users.length > 1) return res.status(400).send('ER500');

    let retUser = users[0];
    delete retUser._id;
    delete retUser.passHash;

    res.json(retUser);
}

export const resetPassword = async(req, res) => {
    let adminUser = await validateSuperadminRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let aid = req.params.aid;

    let users = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: aid
        }
    })

    if(users.length == 0) return res.status(400).send('ER704,aid');
    else if(users.length > 1) return res.status(400).send('ER500');

    let password = makeid(10);
    let passHash = createHash('md5').update(password).digest('hex');

    let user = users[0];
    delete user._id;
    user.passHash = passHash;

    await post(SCM_DB_UPDATE, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: user.aid
        },
        row: user
    })

    res.json({password: password});
}

export const adminUpdateUserProfile = async(req, res) => {
    let adminUser = await validateAdminRole(req.headers['authorization']);
    if(adminUser == null) return res.status(401).send('ER401');

    let aid = req.params.aid;

    let users = await post(SCM_DB_FETCH, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: aid
        }
    })

    if(users.length == 0) return res.status(400).send('ER704,aid');
    else if(users.length > 1) return res.status(400).send('ER500');

    let user = users[0];
    delete user._id;
    user.first_name = req.body.first_name || '';
    user.last_name = req.body.last_name || '';
    user.email = req.body.email || '';
    user.phone = req.body.phone || '';

    await post(SCM_DB_UPDATE, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: user.aid
        },
        row: user
    })

    res.send();
}