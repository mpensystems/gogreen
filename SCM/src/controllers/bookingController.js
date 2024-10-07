

exports.createBooking = async (req, res) => {
    let booking = req.body;

    console.log(JSON.stringify(booking));
    res.json(booking);
}