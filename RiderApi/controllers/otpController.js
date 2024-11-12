import { default as axios } from 'axios'

export function sendExotelOtp(sendTo, otp) {
    //TODO: Implement this
}

export function sendSlackOtp(sendTo, otp) {
    sendSlackMessage(`Login OTP for ${sendTo} is ${otp}`);
}

export function sendTripOtpOverSlack(sendTo, tid, status, otp) {
    switch(status) {
        case 'way-to-pickup':
            sendSlackMessage(`Pickup OTP for ${tid} sent to ${sendTo} is ${otp}`);
            break;
        case 'way-to-drop':
            sendSlackMessage(`Drop OTP for ${tid} sent to ${sendTo} is ${otp}`);
            break;
        case 'way-to-return':
            sendSlackMessage(`Return OTP for ${tid} sent to ${sendTo} is ${otp}`);
            break;
    }
}

function sendSlackMessage (text) {
    let data = JSON.stringify({
        text: text
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
