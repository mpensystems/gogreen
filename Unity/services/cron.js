const cron = require('node-cron');
const api = require('../api.js');
const urls = require('../urls.js');
const bookingService = require('../services/bookingService.js')

//cron to step forward any BookingBids
cron.schedule('* * * * *', async () => { //runs every minute
    let results = await api.post(urls.SCM_DB_FETCH, {
        db: 'redis',
        table: 'BookingBids',
        id: '*'
    })

    console.log(`Processing ${results.length}`);

    //check if bid qualifies for a step up
    let bidsToStep = results.filter(x => {
        if(x.status != 'active') return false;
        if(parseInt(x.updated_at) + parseInt(x.step_period) * 1000 < Date.now()) return true;
        else return false;
    })

    bidsToStep.forEach(x => {
        bookingService.processUnity({
            cmd: 'bid-step',
            p: x
        })
    })
});