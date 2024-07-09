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
                return;
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

        paCtlProc.on('exit', (code) => {
            if (code !== 0) {
                failed = true;
            }
        })

        paCtlProc.stdout.on('close', (code) => {
            if (failed) {
                reject({"error": "Failed to query device volume!"});
                return;
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

        // It's been observed that values under 100, but with a decimal
        // point will set the volume to WAYYYY over 100% when supplied
        // to pactl. As such, split on any decimal point and only take
        // the integer component.
        let volumeString = ""
        try {
            volumeString = volumePercentage.toString().split(".")[0];
        } catch (err) {
            reject({"status": 400, "body": `Invalid volume percentage: ${volumePercentage}`});
            return;
        }

        const paCtlProc = spawn('/usr/bin/pactl', ['set-sink-volume', deviceId.toString(), `${volumeString}%`]);
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

function getActiveDevice() {
    return new Promise((resolve, reject) => {
        const paCtlProc = spawn('/usr/bin/pactl', ['get-default-sink']);
        let pwCliOutput = '';
        let failed = false;

        // The first round of launced process handling is to obtain the name string for
        // the active device. Then, we query all sink device info and look for the
        // one that matches. We're ultimately interested in:
        //  - the integer ID of the device,
        //  - the human-friendly description of the device
        //  - the current volume of the device's channels, in percentage
        paCtlProc.on('error', () => {
            failed = true;
        })

        paCtlProc.stdout.on('data', (data) => {
            pwCliOutput += data;
        });

        paCtlProc.stdout.on('close', (code) => {
            if (failed) {
                reject({"status": 500, "body": {"error": "Failed to determine active audio device!"}});
                return;
            }

            // We have the name of the active device. Now we need to find it's detailed information
            const paCtlInfoProc = spawn('/usr/bin/pactl', ['--format=json', 'list', 'sinks']);
            let activeDeviceName = pwCliOutput.trim();  // Process output will include a newline \n
            let paSinkInfo = '';
            let infoReqFailed = false;

            paCtlInfoProc.on('error', () => {
                infoReqFailed = true;
            })

            paCtlInfoProc.stdout.on('data', (data) => {
                paSinkInfo += data;
            })

            paCtlInfoProc.stdout.on('close', () => {
                if (infoReqFailed) {
                    reject({"status": 500, "body": {"error": "Failed to determine active audio device!"}})
                    return;
                }
                // Now, let's process the JSON and find the device that matches the name in paCliOutput
                const deviceInfo = JSON.parse(paSinkInfo);
                for (let i = 0; i < deviceInfo.length; i++) {
                    if (deviceInfo[i].name === activeDeviceName) {
                        resolve({
                            "id": deviceInfo[i].index,
                            "name": deviceInfo[i].name,
                            "description": deviceInfo[i].description,
                            "volume": {
                                "left": deviceInfo[i].volume["front-left"].value_percent.split("%")[0],
                                "right": deviceInfo[i].volume["front-right"].value_percent.split("%s")[0]
                            }
                        });
                        return;
                    }
                }

                // If we hit this then somehow, we weren't able to find a sink name that
                // matches the result from get-active-sink
                reject({"status": 500, "body": {"error": `Failed to retrieve information for device identifying as ${activeDeviceName}`}});
                return;
            })
        })
    })
}

exports.getSinkDevices = getSinkDevices;
exports.getDeviceVolume = getDeviceVolume;
exports.setDeviceVolume = setDeviceVolume;
exports.getActiveDevice = getActiveDevice;
// exports.sinkDevices = sinkDevices;