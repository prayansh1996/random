#!/bin/bash

# Script to set up cron job for automatic git sync
# Run this once to configure the cron job

SCRIPT_PATH="/home/ec2-user/projects/webdev/random/random/sync-rankings.sh"
LOG_PATH="/home/ec2-user/projects/webdev/random/random/logs/sync.log"

# Ensure logs directory exists
mkdir -p "$(dirname "$LOG_PATH")"

# Create the cron job entry (runs every 15 minutes)
CRON_ENTRY="*/15 * * * * $SCRIPT_PATH >> $LOG_PATH 2>&1"

# Add to crontab if not already present
(crontab -l 2>/dev/null | grep -F "$SCRIPT_PATH") || (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "Cron job configured successfully!"
echo "The sync script will run every 15 minutes"
echo "Logs will be written to: $LOG_PATH"
echo ""
echo "To view the cron job:"
echo "  crontab -l"
echo ""
echo "To view sync logs:"
echo "  tail -f $LOG_PATH"
echo ""
echo "To manually run the sync:"
echo "  $SCRIPT_PATH"