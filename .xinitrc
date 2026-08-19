#!/bin/sh

if command -v polkit-gnome-authentication-agent-1 >/dev/null 2>&1; then
  polkit-gnome-authentication-agent-1 &
elif command -v mate-polkit >/dev/null 2>&1; then
  mate-polkit &
elif [ -x /usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 ]; then
  /usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 &
elif [ -x /usr/libexec/polkit-gnome-authentication-agent-1 ]; then
  /usr/libexec/polkit-gnome-authentication-agent-1 &
elif [ -x /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 ]; then
  /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 &
fi

# BEGIN automatic-monitor-switch
# dwm-session starts and owns monitor-watch so it can stop it when X exits.
export DWM_MONITOR_SWITCH_CONFIG="$HOME/.config/dwm/automatic-monitor-switch"
# END automatic-monitor-switch

feh --bg-scale /home/geremy/.config/suckless/dwm/Wallpaper.jpeg &

exec /usr/local/bin/dwm-session
