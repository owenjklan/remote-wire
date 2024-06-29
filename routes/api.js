var express = require('express');
var pipewire = require('../pipewire-cli')
const {getSinkDevices, getDeviceVolume, setDeviceVolume, getActiveDevice} = require("../pipewire-cli");
const {hostname} = require("node:os");
var router = express.Router();


// API module to interface to PipeWire outputs and operations
router.get('/', function (req, res, next) {
    res.send({"hostname": hostname()});
});

router.get('/devices', function (req, res, next) {
    getSinkDevices().then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.status(error.status).send(error.body);
        }
    );
})

router.get('/activeDevice', function (req, res, next) {
    getActiveDevice().then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.status(error.status).send(error.body);
        }
    )
})

router.get('/volume/:deviceId', function (req, res, next) {
    getDeviceVolume(req.params.deviceId).then(
        (result) => {
            res.send(result);
        },
        (error) => {
            res.status(error.status).send(error.body);
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
