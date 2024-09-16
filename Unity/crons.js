const cron = require('node-cron');

/**
 * Cron to check every row in Redis.BookingBids and step up if time of the previous step has exceeded.
 */
cron.schedule("* * * * *", () => {
    /**
     * if status <> active:
        if BookingBids.current_step == BookingBids.steps:
            BookingBids.status = "ended"
            BookingBids.updated_at = Now()
            BookingBids.ended_at = Now()
                return;
        
        bidIncrement = Round((BookingBids.max_bid - BookingBids.min_bid)/BookingBids.steps)
            BookingBids.current_bid += bidIncrement
            BookingBids.current_dist += dist_increment
        updated_at = Now()
        current_step += 1
     */
})

/**
 * Check if license of driver, or registration of vehicle has expired, and if so the corresponding
 * account must be auto locked for KYC pending. The rider will then be required to update KYC documents
 * and only post KYC verification of the new documents can they accept new bookings.
 */
cron.schedule("0 0 * * *", () => {

})

/**
 * Cron to clear unwanted data from Redis in-memory tables, that runs every minute.
 * 1. Removed older entries from Redis.BookingBids table
 * 2. Remove older entires from Redis.RiderWsAuth table
 */
cron.schedule("* * * * *", () => {
    //delete from Redis.BookingsBid where status <> active and ended_at < DateTime(T - 5 mins)
    //delete from Redis.RiderWsAuth where created_at < DateTime(T - 5 mins)
})

/**
 * Cron to clear unwanted data from MongoDB tables, that runs ones a day.
 * 1. Delete older route history from Mongo.TripRoute table
 */
cron.schedule("0 0 * * *", () => {
    //if EXP != 0 only then delete. This value should be admin configurable
    // delete from Mongo.TripRoute where ended_at < Now() - EXP
})