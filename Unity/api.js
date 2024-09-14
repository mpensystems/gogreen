var request = require('request');

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
            reject('ER500')
        } else resolve(response.body);
    });
})

module.exports = {post}