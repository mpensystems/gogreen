var request = require('request');

const get = async (url, formData, headers) => new Promise(resolve => {
    var options = {
        'method': 'POST',
        'url': url
    };

    if(headers != null) options.headers = headers;
    if(formData != null) options.formData = formData;
    
    request(options, function (error, response) {
        if (error) {
            // throw new Error(error);
        }
        
    });
})

const post = async (url, formData, headers) => new Promise((resolve, reject) => {
    var options = {
        'method': 'POST',
        'url': url
    };

    if(headers != null) options.headers = headers;
    if(formData != null) options.formData = formData;
    
    request(options, function (error, response) {
        if (error) {
            //TODO: Error status processing and error code pass forward is to be implemented.
            reject('ER')
        } else resolve(response.body);
    });
})

module.exports = {post}