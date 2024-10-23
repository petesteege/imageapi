#!/bin/bash

# Check the service role and select the correct supervisor config file
if [ "$SERVICE_ROLE" = "imageapi" ]; then
    SUPERVISOR_CONFIG="/etc/supervisor/conf.d/supervisord_imageapi.conf"
elif [ "$SERVICE_ROLE" = "webgui" ]; then
    SUPERVISOR_CONFIG="/etc/supervisor/conf.d/supervisord_webgui.conf"
else
    echo "Error: Unknown SERVICE_ROLE '$SERVICE_ROLE'"
    exit 1
fi

# Start supervisord with the correct configuration
exec /usr/bin/supervisord -c "$SUPERVISOR_CONFIG"
