import { default as axios } from 'axios'

export function sendExotelOtp(sendTo, otp) {
    //TODO: Implement this
}

export function sendSlackOtp(sendTo, otp) {
    let data = JSON.stringify({
        text: `Login OTP for ${sendTo} is ${otp}`
    })

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://hooks.slack.com/services/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',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}
