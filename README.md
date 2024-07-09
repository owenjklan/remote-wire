# Remote Wire Node Service
To launch the service at boot with SystemD, a few things are required:

1. You need to have a NodeJS installation that installs the `node`
   binary to `/usr/bin/node`. If you're using `nvm` to manage multiple
   node versions from your user's home directory, then you'll need to
   perform a system-wide installation of NodeJS. The specifics of doing
   this will depend on your specific distribution.
2. The `pactl` binary needs to be installed. This is part of the
   Pulse Audio support binaries.

## 