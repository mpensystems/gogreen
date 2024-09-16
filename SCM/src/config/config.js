

const USERNAME = "muthus"
const PASSWORD = "MXA9zQsUdVaAZzz7"

const config = {
    development :{
        // mongoURI:`mongodb+srv://${USERNAME}:${PASSWORD}@efbs.nwp3m7o.mongodb.net/?retryWrites=true&w=majority&appName=eFBS`
        mongoURI:`mongodb+srv://${USERNAME}:${PASSWORD}@efbs.nwp3m7o.mongodb.net/?retryWrites=true&w=majority&appName=eFBS`
    },
    procuction:{
        mongoURI:``
    }

};


module.exports = config