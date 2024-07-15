#!/bin/bash

# Copy unit file to user-specific directory
USER_SYSTEMD_DIR=${HOME}/.config/systemd/user
SERVICE_FILE=remote-wire.service

cp remote-wire.service ${USER_SYSTEMD_DIR}/${SERVICE_FILE}

# This should Just Work on Ubuntu. Other distributions: YMMV
if [ $? -ne 0 ]; then
    echo -e "\n\033[31;1m ** Could not copy service file to ${USER_SYSTEMD_DIR}/${SERVICE_FILE}! **\033[0m"
    echo "This script can be edited, pointing USER_SYSTEMD_DIR to you distribution's user-specific"
    echo "systemd configuration directory."
    exit 1
fi

# Reload the user's systemd daemon, then enable to start at boot
systemctl --user daemon-reload
systemctl --user enable ${SERVICE_FILE}

if [ $? -ne 0 ]; then
    echo -e "\n\033[31;1m ** Failed enabling ${SERVICE_FILE} for automatic startup! **\033[0m"
    exit 1
fi

echo
echo -e "\033[32;1m ✓✓ ${SERVICE_FILE} has been installed and enabled to start at user login ✓✓\033[0m"
echo
echo -e "To inspect the service logs, run: \033[33;1mjournalctl --user -u ${SERVICE_FILE}\033[0m."
echo
echo "There are some environment variables that can be edited to adjust behaviour."
echo
echo -e "These can be edited by running: \033[33;1msystemctl --user edit ${SERVICE_FILE}\033[0m."
echo    "(Be sure the Environment= directives are within an [Service] section, or it won't start!)"
echo -e "\033[1mREMOTE_WIRE_HOST_PORT\033[0m \t\tThis is optional. HTTP port used. 65500 will be used if not provided."
echo -e "\033[1mREMOTE_WIRE_HOST_DESCRIPTION\033[0m \tThis is optional. Description of host provided in multicast announcements."
echo
