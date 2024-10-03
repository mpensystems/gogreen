import multer from 'multer'
import { response } from 'express';
import {rename} from 'fs'
import { validateSt} from '../utils.js';
import { SCM_DB_UPDATE } from '../urls.js';
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
            default:
                res.status(400).send('ER704,header:doc-type');
                return;
        }

        //check that uploaded file is less than 5MB
        if(req.file.size > 5 * 1024 * 1024) {
            res.status(400).send('ER705,5MB');
            return;
        }

        //check that the file extension is supported
        let extension = req.file.filename.split('.');
        extension = extension[extension.length - 1];
        switch(extension.toLowerCase()) {
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
        switch(req.file.mimetype) {
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
        if(rid == null) {
            res.status(401).send('ER401');
            return;
        }

        //Move the file into the KYC folder
        let oldPath = req.file.path;
        let newPath = process.env.STORAGE_DIR + 'kyc/' + req.file.filename;
        rename(oldPath, newPath, function(err) {
            if(err) {
                res.status(500).send('ER500');
                return;
            }
        })

        const fileId = req.file.filename;
        let updateRow = {};
        updateRow[columnName] = fileId;
        

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