#!/bin/bash
set -e

DOTFILES_REPO="${1:-https://github.com/RetroTrigger/dotfiles}"

echo "==> Installing dependencies..."
sudo dnf install -y \
    sway waybar rofi alacritty dunst swaylock swayidle kanshi swaybg \
    brightnessctl pavucontrol libnotify \
    breeze-cursor-theme \
    sassc gtk-murrine-engine gnome-themes-extra \
    fontawesome-6-free-fonts fontawesome-6-brands-fonts \
    google-noto-sans-mono-fonts

echo "==> Installing Tokyo Night GTK theme..."
curl -L https://github.com/Fausto-Korpsvart/Tokyonight-GTK-Theme/archive/refs/heads/master.tar.gz \
    -o /tmp/tokyonight-gtk.tar.gz
tar -xzf /tmp/tokyonight-gtk.tar.gz -C /tmp
cd /tmp/Tokyonight-GTK-Theme-master/themes
bash install.sh --color dark --tweaks storm -l
rm -rf /tmp/Tokyonight-GTK-Theme-master /tmp/tokyonight-gtk.tar.gz
cd ~

echo "==> Applying GTK and cursor settings..."
gsettings set org.gnome.desktop.interface gtk-theme 'Tokyonight-Dark-Storm'
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface cursor-theme 'breeze_cursors'
gsettings set org.gnome.desktop.interface cursor-size 24

echo "==> Cloning dotfiles..."
git clone --bare "$DOTFILES_REPO" "$HOME/.dotfiles"
git --git-dir="$HOME/.dotfiles/" --work-tree="$HOME" config --local status.showUntrackedFiles no
git --git-dir="$HOME/.dotfiles/" --work-tree="$HOME" checkout

echo "==> Setting permissions..."
chmod +x ~/.config/sway/lock.sh

echo ""
echo "Done! Log out and back into Sway to apply everything."
echo ""
echo "NOTE: Review ~/.config/kanshi/config and update monitor names/resolutions"
echo "      to match your hardware before reloading Sway."
