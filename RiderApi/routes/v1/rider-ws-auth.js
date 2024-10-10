import { createHash } from 'crypto';
import { makeid, validateSt } from '../../utils.js';
import { post } from '../../api.js';
import { SCM_DB_INSERT } from '../../urls.js';

export const initiateRiderWsAuth = async (req, res) => {
    let bearer = req.headers['authorization'];
    if(bearer == null) {
        res.status(401).send('ER403');
        return;
    }

    let rid = await validateSt(bearer);
    if(rid == null) {
        res.status(401).send('ER401');
        return;
    }

    let auth = makeid(36);
    let authHash = createHash('md5').update(auth).digest('hex')

    let riderWsAuth = {
        rid:rid,
        created_at: Date.now()
    }

    await post(SCM_DB_INSERT, {
        db: 'redis',
        table: 'RiderWsAuth',
        rows: [
            {
                key: authHash,
                value: riderWsAuth
            }
        ]
    })

    res.json({auth: auth});
}