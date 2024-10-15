var api = require('./api.js');
const URLS = require('./urls.js');

(async () => {
    let h3is = await api.post(URLS.SCM_DB_FETCH, {
        db: 'redis',
        table: 'Grid',
        id: '*',
        keysOnly: true
    })

    let promises = h3is.map(h3i => new Promise(async (resolve) => {
        
    }))
})();
