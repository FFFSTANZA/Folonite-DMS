#!/usr/bin/env bash
#
# setup.sh — detect environment, install dependencies, and configure Folonite DMS.
#
# Usage:
#   ./setup.sh [--pm npm|pnpm|yarn] [--build] [--no-color]
#
# What it does:
#   1. Detects OS and required tools (node >= 18, npm, git, curl).
#   2. Picks a package manager (pnpm preferred — matches vercel.json,
#      falls back to npm; override with --pm).
#   3. Installs project dependencies.
#   4. Configures .env (creates it with sane defaults if missing,
#      validates required VITE_* keys if present).
#   5. Verifies the install (vite binary present).
#   6. Optionally runs a production build (--build).
#
set -euo pipefail

# ---------------------------------------------------------------- paths -----
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
APP_ROOT="$SCRIPT_DIR"
cd "$APP_ROOT"

# ----------------------------------------------------------------- opts -----
PM_OVERRIDE=""
DO_BUILD=0
NO_COLOR=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --pm=*)      PM_OVERRIDE="${1#--pm=}"; shift ;;
    --pm)        PM_OVERRIDE="${2:?ERROR: --pm needs a value: --pm npm|pnpm|yarn}"; shift 2 ;;
    --build)     DO_BUILD=1; shift ;;
    --no-color)  NO_COLOR=1; shift ;;
    -h|--help)
      awk '/^#!/&&NR==1{next} /^\s*#/{sub(/^\s*# ?/,"");print;next} {exit}' "$0"
      echo "Options: [--pm npm|pnpm|yarn] [--build] [--no-color]"
      exit 0 ;;
    *) echo "ERROR: unknown option: $1 (see --help)" >&2; exit 2 ;;
  esac
done

# ---------------------------------------------------------------- colors ----
if [[ "$NO_COLOR" -eq 1 || "${TERM:-dumb}" == "dumb" || ! -t 1 ]]; then
  C_RESET=""; C_INFO=""; C_OK=""; C_WARN=""; C_ERR=""
else
  C_RESET="\033[0m"; C_INFO="\033[1;34m"; C_OK="\033[1;32m"
  C_WARN="\033[1;33m"; C_ERR="\033[1;31m"
fi
info() { echo -e "${C_INFO}[setup]${C_RESET} $*"; }
ok()   { echo -e "${C_OK}[setup] ✓${C_RESET} $*"; }
warn() { echo -e "${C_WARN}[setup] !${C_RESET} $*" >&2; }
die()  { echo -e "${C_ERR}[setup] ✗${C_RESET} $*" >&2; exit 1; }

REQUIRED_NODE_MAJOR=18

# ------------------------------------------------------------ 1. OS detect --
info "Detecting operating system..."
OS_PRETTY="unknown"
if [[ -f /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_PRETTY="${PRETTY_NAME:-$NAME}"
elif [[ "$(uname -s)" == "Darwin" ]]; then
  OS_PRETTY="macOS $(sw_vers -productVersion 2>/dev/null || echo '')"
fi
info "OS: $OS_PRETTY ($(uname -sm))"

command -v git >/dev/null 2>&1  || warn "git not found — only needed for cloning/updating, continuing."
command -v curl >/dev/null 2>&1 || warn "curl not found — port health-checks in start.sh will fall back to /dev/tcp."

# ------------------------------------------------------- 2. Node.js check ---
info "Checking Node.js (>= $REQUIRED_NODE_MAJOR)..."
ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local ver major
    ver="$(node --version | sed 's/^v//')"
    major="${ver%%.*}"
    if [[ "$major" -ge "$REQUIRED_NODE_MAJOR" ]]; then
      ok "Node.js v$ver found ($(command -v node))."
      return 0
    fi
    warn "Node.js v$ver is too old (need >= $REQUIRED_NODE_MAJOR)."
  else
    warn "Node.js not found."
  fi
  return 1
}

if ! ensure_node; then
  info "Attempting automatic Node.js install..."
  installed=0
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq && sudo apt-get install -y -qq nodejs npm \
      && installed=1 || true
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y -q nodejs npm && installed=1 || true
  elif command -v brew >/dev/null 2>&1; then
    brew install node && installed=1 || true
  fi
  ensure_node || die "Could not provision Node.js automatically. Install Node >= $REQUIRED_NODE_MAJOR from https://nodejs.org then re-run ./setup.sh"
fi

if ! command -v npm >/dev/null 2>&1; then
  die "npm not found alongside node ($(command -v node)). Reinstall Node.js from https://nodejs.org"
fi
info "npm $(npm --version) found."

# ---------------------------------------------- 3. package manager select ---
info "Selecting package manager..."
PM=""
if [[ -n "$PM_OVERRIDE" ]]; then
  case "$PM_OVERRIDE" in
    npm|pnpm|yarn) PM="$PM_OVERRIDE" ;;
    *) die "--pm must be one of: npm, pnpm, yarn (got '$PM_OVERRIDE')" ;;
  esac
  info "Using override: $PM"
else
  # vercel.json uses pnpm, and pnpm-lock.yaml ships with the repo → prefer pnpm.
  if command -v pnpm >/dev/null 2>&1; then
    PM="pnpm"
  elif [[ -f pnpm-lock.yaml ]]; then
    info "pnpm-lock.yaml present but pnpm binary missing — installing pnpm..."
    if npm install -g pnpm >/dev/null 2>&1; then
      PM="pnpm"
    else
      sudo npm install -g pnpm && PM="pnpm" || true
    fi
    [[ -z "$PM" ]] && { warn "Could not install pnpm, falling back to npm."; PM="npm"; }
  elif command -v yarn >/dev/null 2>&1; then
    PM="yarn"
  else
    PM="npm"
  fi
fi

case "$PM" in
  pnpm)
    command -v pnpm >/dev/null 2>&1 || die "pnpm selected but binary missing. Run: npm install -g pnpm"
    PM_VERSION="$(pnpm --version)"; PM_INSTALL="pnpm install --no-frozen-lockfile"
    PM_RUN="pnpm run"; PM_EXEC="pnpm exec" ;;
  yarn)
    command -v yarn >/dev/null 2>&1 || die "yarn selected but binary missing."
    PM_VERSION="$(yarn --version)"; PM_INSTALL="yarn install"
    PM_RUN="yarn"; PM_EXEC="yarn exec" ;;
  npm|*)
    PM="npm"
    PM_VERSION="$(npm --version)"; PM_INSTALL="npm install"
    PM_RUN="npm run"; PM_EXEC="npx" ;;
esac
ok "Package manager: $PM v$PM_VERSION"

# ------------------------------------------------- 4. install dependencies --
info "Installing dependencies ($PM_INSTALL)..."
if [[ ! -f package.json ]]; then
  die "package.json not found in $APP_ROOT — are you in the project root?"
fi
# shellcheck disable=SC2086
$PM_INSTALL || die "Dependency install failed. Try deleting node_modules and re-running ./setup.sh"
ok "Dependencies installed."

# ---------------------------------------------------------- 5. configure ----
info "Configuring environment (.env)..."
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    info "Created .env from .env.example — review values before starting."
  else
    cat > .env <<'EOF'
# Folonite DMS — local defaults (generated by setup.sh)
VITE_APP_ID=app-83z1j797a1a9
EOF
    info "Created .env with default VITE_APP_ID."
  fi
else
  ok ".env already exists — leaving it untouched."
fi

# Validate required keys (Vite only exposes VITE_* to the client).
missing=0
for key in VITE_APP_ID; do
  if ! grep -qE "^${key}=" .env; then
    warn "Required key $key missing from .env."
    missing=1
  fi
done
if [[ "$missing" -eq 1 ]]; then
  warn "Add the missing keys to .env before starting the app."
else
  ok "Environment validated."
fi

mkdir -p logs

# ------------------------------------------------------------ 6. verify -----
info "Verifying installation..."
[[ -x node_modules/.bin/vite ]] || [[ -f node_modules/.bin/vite ]] \
  || die "vite binary missing in node_modules/.bin — install failed. Re-run ./setup.sh"
ok "vite $(node_modules/.bin/vite --version 2>/dev/null | head -n1) ready."
node -e "const p=require('./package.json'); if(!p.scripts||!p.scripts.dev||!p.scripts.build) throw new Error('bad scripts')" \
  && ok "package.json scripts (dev/build/preview) present." \
  || die "package.json is missing dev/build/preview scripts."

if [[ "$DO_BUILD" -eq 1 ]]; then
  info "Running production build ($PM_RUN build)..."
  # shellcheck disable=SC2086
  $PM_RUN build || die "Build failed — fix errors above, then run ./start.sh --prod"
  ok "Build succeeded (dist/)."
fi

echo ""
ok "Setup complete."
echo "  Next:  ./start.sh            # dev server (http://localhost:5173)"
echo "         ./start.sh --prod     # production build + preview (http://localhost:4173)"
echo "         ./stop.sh             # stop the running server"
