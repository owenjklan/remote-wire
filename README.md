# Remote Wire Node Service
This is a thin wrapper around the PulseAudio command line control tools,
providing a very simple HTTP interface to allow querying the current
default audio sink (ie: The audio interface your system audio is playing
from) and adjusting its volume, including ability to mute/unmute.

This was initially created to support an educational React Native
application project. A link to the GitHub repository for that app
will be provided when it is published.

Because this is essentially a REST API using JSON for data exchange,
it can be used with any REST client. It is not bound to the Remote
Volume app mentioned above.

## Installing to run at login - Ubuntu
A Systemd unit file has been provided, allowing for the service
to automatically start when a user logs in. There are a few minor
requirements that this service assumes to be true:

1. You need to have a Node.js installation that installs the `node`
   binary to `/usr/bin/node`. If you're using `nvm` to manage multiple
   node versions from your user's home directory, then you'll need to
   perform a system-wide installation of Node.js. The specifics of doing
   this will depend on your specific distribution.
2. The `pactl` binary needs to be installed. This is part of the
   Pulse Audio support binaries. This should be available already
   on an Ubuntu 22.x system (which this was developed, tested and used on).

### Running the installation script
The `install-user-service.sh` script bundles up the work to:
- copy the `remote-wire.service` file to the user-specific systemd directory
  This directory is assumed to be `${HOME}/.config/systemd/user` but the script
  can easily be edited, adjusting the `USER_SYSTEMD_DIR` variable as appropriate
  for your system.
- Enables the service to startup automatically at user login.

### Running the service for all users
If you want this service to operate regardless of the user logged in,
then the script can be edited to remove the `--user` flag from any
`systemctl` commands.

The `remote-wire.service` file will also need to be adjusted like the
following:

```unit file (systemd)
[Install]
WantedBy=multi-user.target  # Replace default.target
```

## Configurable Environment
The following environment variables can be modified to change how the
service functions. Note that assuming the service is running as a `systemd`
service, as detailed above, the correct way to modify these, is to use the
`systemd edit` command to edit an override file.

`REMOTE_WIRE_HOST_PORT`: This controls the TCP port that the HTTP REST API
will be served over. It is optional and if not provided, the default value
of 65500 will be used.

`REMOTE_WIRE_HOST_DESCRIPTION`: This string will be sent as part of the payload
of multicast packets sent on the local network segment, announcing this to
any clients. This is optional and if not set, the `description` key of the
multicast JSON payload may not be present, so keep that in mind for clients.

## Multicast Functionality
The Remote Wire service contained in this repository is configured to
send Multicast datagrams in 5 second intervals. Multicast address details
and sending intervals are currently (as of July 2024) hard-coded but can
easily be edited if required in [multicast.js](./multicast.js).

The Multicast address details currently used are:

**IPv4 Address:**  224.0.0.200

**UDP Port:**  65501
