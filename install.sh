#!/bin/bash
set -e

DOTFILES_REPO="https://github.com/RetroTrigger/dotfiles"

# ── Output helpers ────────────────────────────────────────────

info()    { echo "  --> $*"; }
ok()      { echo "  [ok] $*"; }
warn()    { echo "  [!]  $*"; }
die()     { echo "  [ERR] $*"; exit 1; }

# ── Detect package manager ────────────────────────────────────

if   command -v dnf    &>/dev/null; then PM=dnf
elif command -v apt    &>/dev/null; then PM=apt
elif command -v pacman &>/dev/null; then PM=pacman
elif command -v zypper &>/dev/null; then PM=zypper
else die "No supported package manager found (dnf, apt, pacman, zypper)"; fi

info "Detected package manager: $PM"

case $PM in
    dnf)    UPDATE_CMD="sudo dnf check-update -q || true"; INSTALL_CMD="sudo dnf install -y" ;;
    apt)    UPDATE_CMD="sudo apt update -q";               INSTALL_CMD="sudo apt install -y" ;;
    pacman) UPDATE_CMD="sudo pacman -Sy --noconfirm";      INSTALL_CMD="sudo pacman -S --noconfirm --needed" ;;
    zypper) UPDATE_CMD="sudo zypper refresh";              INSTALL_CMD="sudo zypper install -y" ;;
esac

# ── Package resolution ────────────────────────────────────────
# queue_pkg <binary_to_check> <dnf> <apt> <pacman> <zypper>

MISSING=()

queue_pkg() {
    local bin="$1" dnf_p="$2" apt_p="$3" pac_p="$4" zys_p="$5"
    if command -v "$bin" &>/dev/null; then
        ok "$bin already installed"
        return
    fi
    case $PM in
        dnf)    MISSING+=($dnf_p) ;;
        apt)    MISSING+=($apt_p) ;;
        pacman) MISSING+=($pac_p) ;;
        zypper) MISSING+=($zys_p) ;;
    esac
}

# queue_file_pkg <file_glob> <dnf> <apt> <pacman> <zypper>
queue_file_pkg() {
    local file="$1" dnf_p="$2" apt_p="$3" pac_p="$4" zys_p="$5"
    if ls $file &>/dev/null 2>&1; then
        ok "$dnf_p already present"
        return
    fi
    case $PM in
        dnf)    MISSING+=($dnf_p) ;;
        apt)    MISSING+=($apt_p) ;;
        pacman) MISSING+=($pac_p) ;;
        zypper) MISSING+=($zys_p) ;;
    esac
}

echo ""
echo "==> Checking dependencies..."

queue_pkg sway          sway                            sway                    sway                    sway
queue_pkg waybar        waybar                          waybar                  waybar                  waybar
queue_pkg rofi          rofi                            rofi                    rofi-wayland            rofi
queue_pkg alacritty     alacritty                       alacritty               alacritty               alacritty
queue_pkg dunst         dunst                           dunst                   dunst                   dunst
queue_pkg swaylock      swaylock                        swaylock                swaylock                swaylock
queue_pkg swayidle      swayidle                        swayidle                swayidle                swayidle
queue_pkg kanshi        kanshi                          kanshi                  kanshi                  kanshi
queue_pkg swaybg        swaybg                          swaybg                  swaybg                  swaybg
queue_pkg brightnessctl brightnessctl                   brightnessctl           brightnessctl           brightnessctl
queue_pkg pavucontrol   pavucontrol                     pavucontrol             pavucontrol             pavucontrol
queue_pkg notify-send   libnotify                       libnotify-bin           libnotify               libnotify-tools
queue_pkg sassc         sassc                           sassc                   sassc                   sassc
queue_pkg git           git                             git                     git                     git
queue_pkg curl          curl                            curl                    curl                    curl

# Fonts — check via fc-list
if fc-list | grep -qi "noto sans mono"; then
    ok "Noto Sans Mono already installed"
else
    case $PM in
        dnf)    MISSING+=(google-noto-sans-mono-fonts) ;;
        apt)    MISSING+=(fonts-noto-mono) ;;
        pacman) MISSING+=(noto-fonts) ;;
        zypper) MISSING+=(google-noto-sans-mono-fonts) ;;
    esac
fi

if fc-list | grep -qi "font awesome"; then
    ok "Font Awesome already installed"
else
    case $PM in
        dnf)    MISSING+=(fontawesome-6-free-fonts fontawesome-6-brands-fonts) ;;
        apt)    MISSING+=(fonts-font-awesome) ;;
        pacman) MISSING+=(ttf-font-awesome) ;;
        zypper) MISSING+=(fontawesome-fonts) ;;
    esac
fi

# Breeze cursor
if [ -d /usr/share/icons/breeze_cursors ]; then
    ok "Breeze cursor already installed"
else
    case $PM in
        dnf)    MISSING+=(breeze-cursor-theme) ;;
        apt)    MISSING+=(breeze-cursor-theme) ;;
        pacman) MISSING+=(breeze) ;;
        zypper) MISSING+=(breeze5-cursors) ;;
    esac
fi

# GTK Murrine engine
if ls /usr/lib*/gtk-2.0/*/engines/libmurrine.so &>/dev/null 2>&1; then
    ok "GTK Murrine engine already installed"
else
    case $PM in
        dnf)    MISSING+=(gtk-murrine-engine) ;;
        apt)    MISSING+=(gtk2-engines-murrine) ;;
        pacman) MISSING+=(gtk-engine-murrine) ;;
        zypper) MISSING+=(gtk2-engine-murrine) ;;
    esac
fi

# GNOME themes extra (provides Adwaita)
queue_file_pkg "/usr/share/themes/Adwaita" \
    gnome-themes-extra gnome-themes-extra gnome-themes-extra gnome-themes-extra

# ── Install missing packages ──────────────────────────────────

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "==> Installing missing packages: ${MISSING[*]}"
    eval "$UPDATE_CMD"
    $INSTALL_CMD "${MISSING[@]}"
else
    echo ""
    ok "All dependencies satisfied"
fi

# ── Tokyo Night GTK theme ─────────────────────────────────────

echo ""
echo "==> Tokyo Night GTK theme..."

if [ -d "$HOME/.themes/Tokyonight-Dark-Storm" ]; then
    ok "Tokyo Night GTK theme already installed"
else
    info "Downloading and installing..."
    curl -fsSL https://github.com/Fausto-Korpsvart/Tokyonight-GTK-Theme/archive/refs/heads/master.tar.gz \
        -o /tmp/tokyonight-gtk.tar.gz
    tar -xzf /tmp/tokyonight-gtk.tar.gz -C /tmp
    cd /tmp/Tokyonight-GTK-Theme-master/themes
    bash install.sh --color dark --tweaks storm -l
    rm -rf /tmp/Tokyonight-GTK-Theme-master /tmp/tokyonight-gtk.tar.gz
    cd ~
    ok "Tokyo Night GTK theme installed"
fi

# ── Apply GTK and cursor settings ────────────────────────────

echo ""
echo "==> Applying settings..."

gsettings set org.gnome.desktop.interface gtk-theme     'Tokyonight-Dark-Storm'
gsettings set org.gnome.desktop.interface color-scheme  'prefer-dark'
gsettings set org.gnome.desktop.interface cursor-theme  'breeze_cursors'
gsettings set org.gnome.desktop.interface cursor-size   24
ok "GTK theme and cursor applied"

# ── Dotfiles ──────────────────────────────────────────────────

echo ""
echo "==> Dotfiles..."

if [ -d "$HOME/.dotfiles" ]; then
    ok "Dotfiles repo already exists, skipping clone"
else
    info "Cloning bare repo..."
    git clone --bare "$DOTFILES_REPO" "$HOME/.dotfiles"
    git --git-dir="$HOME/.dotfiles/" --work-tree="$HOME" \
        config --local status.showUntrackedFiles no

    # Backup any conflicting files before checkout
    CONFLICTS=$(git --git-dir="$HOME/.dotfiles/" --work-tree="$HOME" \
        checkout 2>&1 | grep -E "^\s+\." | awk '{print $1}' || true)

    if [ -n "$CONFLICTS" ]; then
        warn "Backing up conflicting files to ~/.dotfiles-backup/"
        mkdir -p "$HOME/.dotfiles-backup"
        echo "$CONFLICTS" | while read -r f; do
            mkdir -p "$HOME/.dotfiles-backup/$(dirname "$f")"
            mv "$HOME/$f" "$HOME/.dotfiles-backup/$f"
            warn "  Backed up: ~/$f"
        done
    fi

    git --git-dir="$HOME/.dotfiles/" --work-tree="$HOME" checkout
    ok "Dotfiles checked out"
fi

# ── Shell alias ───────────────────────────────────────────────

for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$rc" ] && ! grep -q "alias dotfiles=" "$rc"; then
        echo "alias dotfiles='git --git-dir=\$HOME/.dotfiles/ --work-tree=\$HOME'" >> "$rc"
        ok "Added dotfiles alias to $rc"
    fi
done

# ── Permissions ───────────────────────────────────────────────

chmod +x "$HOME/.config/sway/lock.sh"

# ── Done ──────────────────────────────────────────────────────

echo ""
echo "  Installation complete!"
echo ""
echo "  NOTE: Review ~/.config/kanshi/config and update monitor"
echo "        names/resolutions to match your hardware."
echo ""
echo "  Run 'source ~/.bashrc' to activate the dotfiles alias,"
echo "  then log out and back into Sway to apply everything."
echo ""
