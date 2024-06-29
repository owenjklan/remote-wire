var express = require('express');
var pipewire = require('../pipewire-cli')
const {getSinkDevices, getDeviceVolume, setDeviceVolume} = require("../pipewire-cli");
var router = express.Router();


// API module to interface to PipeWire outputs and operations
router.get('/', function (req, res, next) {
    res.send("Hello World!");
});

router.get('/devices', function (req, res, next) {
    getSinkDevices().then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.send(error)
        }
    );
})

router.get('/volume/:deviceId', function (req, res, next) {
    getDeviceVolume(req.params.deviceId).then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.send(error);
        }
    )
})

router.post('/volume/:deviceId', function (req, res, next) {
    const settingsPayload = req.body;
    setDeviceVolume(req.params.deviceId, settingsPayload.volume).then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.status(error.status).send(error.body);
        }
    )
})

module.exports = router;
