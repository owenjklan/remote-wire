const {spawn} = require("child_process");

function getSinkDevices() {
    return new Promise((resolve, reject) => {
        const paCtlProc = spawn('/usr/bin/pactl', ['--format=json', 'list', 'sinks']);
        let failed = false;
        let pwCliOutput = '';

        paCtlProc.on('error', () => {
            failed = true;
        })

        paCtlProc.stdout.on('data', (data) => {
            pwCliOutput += data;
        });

        paCtlProc.stdout.on('close', (code) => {
            if (failed) {
                reject({"error": "Failed to query sink devices!"})
            } else {
                const sinkDevices = JSON.parse(pwCliOutput);
                resolve(sinkDevices);
            }
        })
    });
}

function getDeviceVolume(deviceId) {
    return new Promise((resolve, reject) => {
        const paCtlProc = spawn('/usr/bin/pactl', ['get-sink-volume', deviceId.toString()]);
        let failed = false;
        let pwCliOutput = '';

        paCtlProc.on('error', () => {
            failed = true;
        })

        paCtlProc.stdout.on('data', (data) => {
            pwCliOutput += data;
        });

        paCtlProc.stdout.on('close', (code) => {
            if (failed) {
                reject({"error": "Failed to query device volume!"});
            } else {
                let volumeMatches = /(\d{1,3}%)/g.exec(pwCliOutput);
                console.log(volumeMatches);
                resolve({"left": volumeMatches[0], "right": volumeMatches[1]});
            }
        })
    });
}

function setDeviceVolume(deviceId, volumePercentage) {
    return new Promise((resolve, reject) => {
        // Check value
        if (volumePercentage < 0 || volumePercentage > 100) {
            reject({"status": 400, "body": {"error": `Invalid volume percentage: ${volumePercentage}`}});
            return;  // To ensure the success code doesn't run in the failure case.
        }

        const paCtlProc = spawn('/usr/bin/pactl', ['set-sink-volume', deviceId.toString(), `${volumePercentage}%`]);
        let failed = false;
        let pwCliOutput = '';

        paCtlProc.on('error', () => {
            failed = true;
        })

        paCtlProc.stdout.on('data', (data) => {
            pwCliOutput += data;
        });

        paCtlProc.stdout.on('close', (code) => {
            if (failed) {
                reject({"status": 500, "body": {"error": "Failed to set device volume!"}})
                return;
            } else {
                resolve({"success": true});
            }
        })
    })
}

exports.getSinkDevices = getSinkDevices;
exports.getDeviceVolume = getDeviceVolume;
exports.setDeviceVolume = setDeviceVolume;
// exports.sinkDevices = sinkDevices;