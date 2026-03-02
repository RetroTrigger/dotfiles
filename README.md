# dotfiles

My personal Sway WM rice on Fedora Linux — Tokyo Night theme.

![Tokyo Night](https://raw.githubusercontent.com/RetroTrigger/dotfiles/main/.config/sway/matrix-tokyonight.png)

## Overview

| Component        | Tool                          |
|-----------------|-------------------------------|
| Window Manager  | Sway 1.11                     |
| Bar             | Waybar                        |
| Terminal        | Alacritty                     |
| Launcher        | Rofi (Wayland)                |
| Notifications   | Dunst                         |
| Lock Screen     | Swaylock                      |
| GTK Theme       | Tokyo Night Storm Dark        |
| Cursor          | Breeze Dark                   |
| Wallpaper       | Matrix Tokyo Night            |
| Color Scheme    | Tokyo Night                   |
| Font            | Noto Sans Mono                |
| Icons           | Font Awesome 6                |

## Features

- Tokyo Night color scheme across all components
- Transparent black Waybar and Alacritty (matching opacity)
- Font Awesome workspace icons (terminal, browser, files, code, music)
- Smart gaps — collapse when only one window is open
- No title bars on tiling windows
- Auto-lock after 10 minutes via swayidle
- Volume and brightness OSD via dunst progress bar
- Multi-monitor support via kanshi

## Keybinds

| Keybind               | Action                        |
|----------------------|-------------------------------|
| `Super + Return`     | Open terminal (Alacritty)     |
| `Super + D`          | Open launcher (Rofi)          |
| `Super + Q`          | Close focused window          |
| `Super + F`          | Fullscreen                    |
| `Super + Tab`        | Cycle workspaces forward      |
| `Super + Shift + Tab`| Cycle workspaces backward     |
| `Super + Ctrl + L`   | Lock screen                   |
| `Super + Shift + C`  | Reload Sway config            |
| `Super + Shift + E`  | Exit Sway                     |
| `Super + H/J/K/L`   | Focus left/down/up/right      |
| `Super + Shift + H/J/K/L` | Move window              |
| `Super + R`          | Resize mode                   |
| `Super + Space`      | Toggle floating               |

## Install

On a fresh Fedora Sway install, run:

```bash
bash <(curl -s https://raw.githubusercontent.com/RetroTrigger/dotfiles/main/install.sh)
```

This will:
1. Install all required packages via dnf
2. Download and install the Tokyo Night GTK theme
3. Apply GTK and cursor settings
4. Clone and check out these dotfiles

> **Note:** After install, review `~/.config/kanshi/config` and update the monitor names and resolutions to match your hardware.

## Managing Dotfiles

This repo uses a bare git repository. The `dotfiles` alias acts as a git command scoped to your home directory:

```bash
# Add the alias (already in ~/.bashrc after install)
alias dotfiles='git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

# Check status
dotfiles status

# Stage a changed file
dotfiles add ~/.config/waybar/style.css

# Commit changes
dotfiles commit -m "Update waybar style"

# Push to remote
dotfiles push
```
