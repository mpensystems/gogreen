import { createHash } from 'crypto';
import { makeid } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_DELETE, SCM_DB_FETCH, SCM_DB_INSERT, SCM_DB_UPDATE } from '../../urls.js';
import { passwordStrength } from 'check-password-strength'
import { getAdminUserFromSt } from '../../utils.js';

export const updateProfile = async (req, res) => {
    let adminUser = await getAdminUserFromSt(req.headers['authorization'])
    if(adminUser == null) return res.status(401).send('ER401');

    adminUser.first_name = req.body.first_name || '';
    adminUser.last_name = req.body.last_name || '';
    adminUser.email = req.body.email || '';
    adminUser.phone = req.body.phone || '';

    await post(SCM_DB_UPDATE, {
        db: 'mongo',
        table: 'AdminUsers',
        condition: {
            aid: adminUser.aid
        },
        row: adminUser
    })

    res.send();
}

export const getProfile = async(req, res) => {
    let adminUser = await getAdminUserFromSt(req.headers['authorization'])
    if(adminUser == null) return res.status(401).send('ER401');

    delete adminUser.aid;
    delete adminUser.passHash;

    res.json(adminUser);
}