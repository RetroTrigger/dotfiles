# dotfiles

My personal Sway WM rice — Tokyo Night theme.

![Tokyo Night](https://raw.githubusercontent.com/RetroTrigger/dotfiles/main/.config/sway/matrix-tokyonight.png)

## Overview

| Component       | Tool                    |
|----------------|-------------------------|
| Window Manager | Sway 1.11               |
| Bar            | Waybar                  |
| Terminal       | Alacritty               |
| Launcher       | Rofi (Wayland)          |
| Notifications  | Dunst                   |
| Lock Screen    | Swaylock + Swayidle     |
| GTK Theme      | Tokyo Night Storm Dark  |
| Cursor         | Breeze Dark             |
| Wallpaper      | Matrix Tokyo Night      |
| Color Scheme   | Tokyo Night             |
| Font           | Noto Sans Mono          |
| Icons          | Font Awesome 6          |
| Multi-monitor  | Kanshi                  |

## Features

- Tokyo Night color scheme across all components
- Matching transparent black background on Waybar and Alacritty
- Font Awesome workspace icons (terminal, browser, files, code, music)
- Smart gaps — collapse when only one window is open
- No title bars on tiling windows
- Auto-lock after 10 minutes via swayidle, displays off after 11
- Volume and brightness OSD via dunst progress bar
- Multi-monitor support via kanshi

## Keybinds

| Keybind                    | Action                      |
|---------------------------|-----------------------------|
| `Super + Return`           | Open terminal (Alacritty)   |
| `Super + D`                | Open launcher (Rofi)        |
| `Super + Q`                | Close focused window        |
| `Super + F`                | Fullscreen                  |
| `Super + Tab`              | Cycle workspaces forward    |
| `Super + Shift + Tab`      | Cycle workspaces backward   |
| `Super + Ctrl + L`         | Lock screen                 |
| `Super + Shift + C`        | Reload Sway config          |
| `Super + Shift + E`        | Exit Sway                   |
| `Super + H/J/K/L`         | Focus left/down/up/right    |
| `Super + Shift + H/J/K/L` | Move window                 |
| `Super + R`                | Resize mode                 |
| `Super + Space`            | Toggle floating             |

## Install

Works on any distro with a supported package manager (`dnf`, `apt`, `pacman`, `zypper`):

```bash
bash <(curl -s https://raw.githubusercontent.com/RetroTrigger/dotfiles/main/install.sh)
```

The install script will:
1. Detect your package manager and install only missing dependencies
2. Download and install the Tokyo Night GTK theme
3. Apply GTK theme, dark mode, and cursor settings
4. Clone this repo and check out dotfiles into `$HOME`
5. Back up any conflicting files to `~/.dotfiles-backup/`
6. Add the `dotfiles` alias to `~/.bashrc` and `~/.zshrc`

> **Note:** After install, review `~/.config/kanshi/config` and update the monitor
> names and resolutions to match your hardware before reloading Sway.

## Managing Dotfiles

This repo uses a bare git repository. The `dotfiles` alias works like `git` but scoped to your home directory:

```bash
# Check status
dotfiles status

# Stage a changed file
dotfiles add ~/.config/waybar/style.css

# Commit changes
dotfiles commit -m "Update waybar style"

# Push to remote
dotfiles push
```
