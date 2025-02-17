import multer from 'multer'
import { response } from 'express';
import { rename, existsSync, readFile } from 'fs'
import { validateSt, validateStAndFetchRider } from '../utils.js';
import { SCM_DB_FETCH, SCM_DB_UPDATE } from '../urls.js';
import { post } from '../api.js';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.STORAGE_DIR + 'temp/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let extension = file.originalname.split('.');
        extension = extension[extension.length - 1];
        cb(null, uniqueSuffix + '.' + extension);
    }
})

export const upload = multer({ storage: storage });

export const handleKycDocUpload = async (req, res) => {
    try {
        //Check if doc-type header is valid
        let columnName = null;
        let docType = req.headers['doc-type'];
        switch (docType) {
            case 'id_front':
                columnName = 'photo_id_front';
                break;
            case 'id_back':
                columnName = 'photo_id_back';
                break;
            case 'utility_bill':
                columnName = 'utility_bill';
                break;
            case 'pan':
                columnName = 'pan_copy';
                break;
            case 'rc_front':
                columnName = 'rc_copy_front';
                break;
            case 'rc_back':
                columnName = 'rc_copy_back';
                break;
            case 'license_front':
                columnName = 'drivers_license_front';
                break;
            case 'license_back':
                columnName = 'drivers_license_back';
                break;
            case 'user_photo':
                columnName = 'photo';
                break;
            case  'cancelled_cheque':
                columnName = 'cancelled_cheque';
                break;
            default:
                res.status(400).send('ER704,header:doc-type');
                return;
        }

        //check that uploaded file is less than 5MB
        if (req.file.size > 5 * 1024 * 1024) {
            res.status(400).send('ER705,5MB');
            return;
        }

        //check that the file extension is supported
        let extension = req.file.filename.split('.');
        extension = extension[extension.length - 1];
        switch (extension.toLowerCase()) {
            case 'png':
            case 'jpeg':
            case 'jpg':
            case 'pdf':
                break; 
            default:
                res.status(400).send(`ER706,${extension}`);
                return;
        }

        //check that the mime type is supported
        switch (req.file.mimetype) {
            case 'image/png':
            case 'image/bmp':
            case 'image/jpeg':
            case 'application/pdf':
                break;
            default:
                res.status(400).send(`ER706,${req.file.mimetype}`);
                return;
        }

        //Validate the session token and fetch the corresponding rider object
        let rid = await validateSt(req.headers['authorization']);
        if (rid == null) {
            res.status(401).send('ER401');
            return;
        }

        //Move the file into the KYC folder
        let oldPath = req.file.path;
        let newPath = process.env.STORAGE_DIR + 'kyc/' + req.file.filename;
        rename(oldPath, newPath, function (err) {
            if (err) {
                res.status(500).send('ER500');
                return;
            }
        })

        const fileId = req.file.filename;
        
        //fetch rider object
        let result = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Riders',
            condition: {
                rid: rid
            }
        })

        if(result == null || result.length == 0) return res.status(500).send('ER500');
        let updateRow = result[0];
        updateRow[columnName] = fileId;
        delete updateRow._id;

        //update file ID on the rider object
        await post(SCM_DB_UPDATE, {
            db: 'mongo',
            table: 'Riders',
            condition: {
                rid: rid
            },
            row: updateRow
        })

        res.status(200).send();
    } catch (error) {
        res.status(500).send('ER500');
    }
}

export const fetchKycDoc = async (req, res) => {
    const fileid = req.params.fileid;
    
    let rider = await validateStAndFetchRider(req.headers['authorization']);
    if (rider == null) {
        res.status(401).send('ER401');
        return;
    }

    if (rider.photo_id_front == fileid
        || rider.photo_id_back == fileid
        || rider.utility_bill == fileid
        || rider.pan_copy == fileid
        || rider.rc_copy_front == fileid
        || rider.rc_copy_back == fileid
        || rider.drivers_license_front == fileid
        || rider.drivers_license_back == fileid
        || rider.photo == fileid
        || rider.cancelled_cheque == fileid) {
            if(existsSync(process.env.STORAGE_DIR + 'kyc/' + fileid)) res.download(process.env.STORAGE_DIR + 'kyc/' + fileid);
            else res.status(400).send(`ER707,${fileid}`)
    } else res.status(401).send('ER405');
}

export const handleTripDocUpload = async (req, res) => {
    try {
        //Check if doc-type header is valid
        let docType = req.headers['doc-type'];
        switch (docType) {
            case 'pickup':
            case 'drop':
            case 'returned':
            case 'damaged':
            case 'destroyed':
                break;
            default:
                res.status(400).send('ER704,header:doc-type');
                return;
        }

        //check that uploaded file is less than 5MB
        if (req.file.size > 5 * 1024 * 1024) {
            res.status(400).send('ER705,5MB');
            return;
        }

        //check that the file extension is supported
        let extension = req.file.filename.split('.');
        extension = extension[extension.length - 1];
        switch (extension.toLowerCase()) {
            case 'png':
            case 'jpeg':
            case 'jpg':
                break; 
            default:
                res.status(400).send(`ER706,${extension}`);
                return;
        }

        //check that the mime type is supported
        switch (req.file.mimetype) {
            case 'image/png':
            case 'image/jpeg':
                break;
            default:
                res.status(400).send(`ER706,${req.file.mimetype}`);
                return;
        }

        //Validate the session token and fetch the corresponding rider object
        let rid = await validateSt(req.headers['authorization']);
        if (rid == null) return res.status(401).send('ER401');

        //Move the file into the Trips folder
        let oldPath = req.file.path;
        let newPath = process.env.STORAGE_DIR + 'trips/' + req.file.filename;
        rename(oldPath, newPath, function (err) {
            if (err) throw(err);
        })

        const fileId = req.file.filename;

        //fetch rider object
        let result = await post(SCM_DB_FETCH, {
            db: 'mongo',
            table: 'Riders',
            condition: {
                rid: rid
            }
        })

        if(result == null || result.length == 0) return res.status(500).send('ER500');
        let updateRow = result[0];
        updateRow.photos.push(fileId);

        //update file ID on the rider object
        await post(SCM_DB_UPDATE, {
            db: 'mongo',
            table: 'Riders',
            condition: {
                rid: rid
            },
            row: updateRow
        })

        res.status(200).send()
    } catch (error) {
        res.status(500).send('ER500')
    }
}