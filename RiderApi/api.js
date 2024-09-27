var request = require('request');

const axios = require('axios');

const post = async (url, formData, headers) => new Promise((resolve, reject) => {
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
        reject('ER500');
    })
})

module.exports = {post}