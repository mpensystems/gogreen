import { default as axios } from 'axios';
import {SCM_DB_FETCH} from './urls.js';

export const post = async (url, formData, headers) => new Promise((resolve, reject) => {
    let config = {
        method: 'post',
        url: url
    }

    console.log(url);

    if(headers != null) {
        config.headers = headers;
        config.headers['Content-Type'] = 'application/json'
    } else {
        config.headers = {
            'Content-Type': 'application/json'
        }
    }
    if(formData != null) config.data = JSON.stringify(formData);

    axios.request(config).then(response => {
        resolve(response.data);
    }).catch(err => {
        console.log(err);
        if(err.response.data.startsWith('ER')) reject(err.response.data);
        else reject('ER500');
    })
})

export const fetchOne = (formData, headers) => new Promise(async (resolve, reject) => {
    try {
        let response = await post(SCM_DB_FETCH, formData, headers);
        if(response == null || response.length == 0) reject('ER500');
        resolve(response[0]);
    } catch(err) {
        console.error(err);
        reject('ER500');
    }
});