var express = require('express');
var router = express.Router();
const yaml = require('js-yaml');
const fs = require('fs');

router.get('/', (req, res) => {
    let config = yaml.load(fs.readFileSync('./config/sysconfig.yaml', {encoding: 'utf-8'}));
    res.json(config);
})

module.exports = router;