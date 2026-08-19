#!/bin/sh
# dwm autostart - sourced from .xinitrc

# Prevent multiple instances
LOCKFILE="/tmp/dwm-autostart-${USER}.lock"
if [ -f "$LOCKFILE" ] && kill -0 "$(cat "$LOCKFILE" 2>/dev/null)" 2>/dev/null; then
    exit 0
fi
echo $$ > "$LOCKFILE"

# Set wallpaper (single instance)
pgrep -x feh >/dev/null || feh --no-fehbg --bg-scale "$HOME/.config/suckless/dwm/Wallpaper.jpeg" &

# Other autostart commands here...
# pgrep -x xbindkeys >/dev/null || xbindkeys &
# pgrep -x picom >/dev/null || picom --config "$HOME/.config/picom/picom.conf" &
# pgrep -x dunst >/dev/null || dunst &

# Cleanup lock on exit
trap 'rm -f "$LOCKFILE"' EXIT