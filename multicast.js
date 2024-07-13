const dgram = require('dgram');
const {hostname} = require("node:os");

// Multicast addresses are assigned by IANA.
// https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml

let runningInterval = null;

const startMulticastBroadcast = () =>{
    const PORT = 65501;
    const MULTICAST_ADDR = "224.0.0.200";
    const server = dgram.createSocket("udp4");

    server.bind(PORT, () => {
        server.setBroadcast(true);
        server.setMulticastTTL(128);
        server.addMembership(MULTICAST_ADDR);
    });

    const broadcastNew = () =>
    {
        const message = new Buffer.from(
            JSON.stringify({
                hostname: hostname(),
                description: process.env.REMOTE_WIRE_HOST_DESCRIPTION,
                port: process.env.REMOTE_WIRE_HOST_PORT
            })
        );
        server.send(message, 0, message.length, PORT, MULTICAST_ADDR);
    }

    runningInterval = setInterval(broadcastNew, 5000);
}

const endMulticastBroadcast = () =>{
    if (runningInterval){
        clearInterval(runningInterval);
        runningInterval = null;
    }
}

exports.startMulticastBroadcast = startMulticastBroadcast;
exports.endMulticastBroadcast = endMulticastBroadcast;
