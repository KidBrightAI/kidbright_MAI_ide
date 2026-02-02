#!/bin/sh

echo "Configuring startup (Port 5050)..."

# No longer modifying maixvision - assuming it's restored and running.
# Kill potential old instances
rm -f /etc/init.d/S99ws_shell
killall python3 2>/dev/null

# Create init script
INIT_SCRIPT="/etc/init.d/S99ws_shell"

# Use safe echo (since we are running after dos2unix, these newlines will be LF)
echo '#!/bin/sh' > $INIT_SCRIPT
echo 'case "$1" in' >> $INIT_SCRIPT
echo '  start)' >> $INIT_SCRIPT
echo '    echo "Starting ws_shell (5050)..."' >> $INIT_SCRIPT
# Port 5050 set in ws_shell.py
echo '    /usr/bin/python3 -u /root/ws_shell.py > /root/ws_shell.log 2>&1 &' >> $INIT_SCRIPT
echo '    sleep 5' >> $INIT_SCRIPT
echo '    echo "Starting maix_stream (8000)..."' >> $INIT_SCRIPT
echo '    /usr/bin/python -u /root/maix_stream.py > /root/maix_stream.log 2>&1 &' >> $INIT_SCRIPT
echo '    ;;' >> $INIT_SCRIPT
echo '  stop)' >> $INIT_SCRIPT
echo '    killall python3 2>/dev/null' >> $INIT_SCRIPT
echo '    killall python 2>/dev/null' >> $INIT_SCRIPT
echo '    ;;' >> $INIT_SCRIPT
echo '  restart|reload)' >> $INIT_SCRIPT
echo '    "$0" stop' >> $INIT_SCRIPT
echo '    "$0" start' >> $INIT_SCRIPT
echo '    ;;' >> $INIT_SCRIPT
echo '  *)' >> $INIT_SCRIPT
echo '    "$0" start' >> $INIT_SCRIPT
echo '    exit 0' >> $INIT_SCRIPT
echo 'esac' >> $INIT_SCRIPT
echo 'exit 0' >> $INIT_SCRIPT

chmod +x $INIT_SCRIPT

# Start service
$INIT_SCRIPT start

echo "Setup complete. ws_shell running on 5050."
