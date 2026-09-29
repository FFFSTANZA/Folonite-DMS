#!/usr/bin/env bash
#
# start.sh — start the Folonite DMS application.
#
# Usage:
#   ./start.sh [--dev|--prod] [--port PORT] [--host HOST]
#              [--foreground|--background] [--no-open] [--no-color]
#
# Modes:
#   --dev         Vite dev server (default). Hot reload, no build needed.
#   --prod        Production: runs `build` then serves dist/ via `vite preview`.
#
# Defaults: dev → port 5173, prod → port 4173, host 127.0.0.1.
# Runs in background by default (PID in .app.pid, output in logs/app.log).
# Use --foreground to run attached to the terminal.
#
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
APP_ROOT="$SCRIPT_DIR"
cd "$APP_ROOT"

MODE="dev"; PORT=""; HOST="127.0.0.1"
FOREGROUND=0; NO_OPEN=0; NO_COLOR=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dev)         MODE="dev"; shift ;;
    --prod)        MODE="prod"; shift ;;
    --port=*)      PORT="${1#--port=}"; shift ;;
    --port)        PORT="${2:?ERROR: --port needs a value}"; shift 2 ;;
    --host=*)      HOST="${1#--host=}"; shift ;;
    --host)        HOST="${2:?ERROR: --host needs a value}"; shift 2 ;;
    --foreground)  FOREGROUND=1; shift ;;
    --background)  FOREGROUND=0; shift ;;
    --no-open)     NO_OPEN=1; shift ;;
    --no-color)    NO_COLOR=1; shift ;;
    -h|--help)
      awk '/^#!/&&NR==1{next} /^\s*#/{sub(/^\s*# ?/,"");print;next} {exit}' "$0"
      echo "Options: [--dev|--prod] [--port PORT] [--host HOST] [--foreground|--background] [--no-open]"
      exit 0 ;;
    *) echo "ERROR: unknown option: $1 (see --help)" >&2; exit 2 ;;
  esac
done

if [[ -z "$PORT" ]]; then
  [[ "$MODE" == "prod" ]] && PORT=4173 || PORT=5173
fi
[[ "$PORT" =~ ^[0-9]+$ ]] || { echo "ERROR: --port must be numeric (got '$PORT')" >&2; exit 2; }

if [[ "$NO_COLOR" -eq 1 || "${TERM:-dumb}" == "dumb" || ! -t 1 ]]; then
  C_RESET=""; C_INFO=""; C_OK=""; C_WARN=""; C_ERR=""
else
  C_RESET="\033[0m"; C_INFO="\033[1;34m"; C_OK="\033[1;32m"
  C_WARN="\033[1;33m"; C_ERR="\033[1;31m"
fi
info() { echo -e "${C_INFO}[start]${C_RESET} $*"; }
ok()   { echo -e "${C_OK}[start] ✓${C_RESET} $*"; }
warn() { echo -e "${C_WARN}[start] !${C_RESET} $*" >&2; }
die()  { echo -e "${C_ERR}[start] ✗${C_RESET} $*" >&2; exit 1; }

PID_FILE="$APP_ROOT/.app.pid"
LOG_FILE="$APP_ROOT/logs/app.log"

# ------------------------------------------------- pre-flight: setup first --
[[ -f package.json ]] || die "package.json not found in $APP_ROOT."
if [[ ! -d node_modules || ! -f node_modules/.bin/vite ]]; then
  warn "Dependencies missing — running ./setup.sh first."
  ./setup.sh || die "Setup failed, cannot start."
fi
[[ -f .env ]] || warn "No .env file — running with Vite defaults. Run ./setup.sh to generate one."

# ------------------------------------------------ already running? -----------
if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
    ok "App already running (PID $old_pid). Logs: $LOG_FILE"
    echo "  Stop it with: ./stop.sh"
    exit 0
  fi
  warn "Removing stale PID file (PID ${old_pid:-?} not alive)."
  rm -f "$PID_FILE"
fi

# ------------------------------------------------------ port free? ----------
port_in_use() {
  local p="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -qE ":${p}[[:space:]]"
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$p" -sTCP:LISTEN -t >/dev/null 2>&1
  else
    (echo >/dev/tcp/127.0.0.1/"$p") >/dev/null 2>&1
  fi
}
if port_in_use "$PORT"; then
  die "Port $PORT is already in use. Stop the other process (./stop.sh --port $PORT) or pick another: ./start.sh --port <PORT>"
fi

# ------------------------------------------------- pick package manager -----
if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then PM_RUN="pnpm run"; PM_EXEC="pnpm exec";
elif [[ -f node_modules/.bin/vite ]]; then PM_RUN="npm run"; PM_EXEC="npx";
else PM_RUN="npm run"; PM_EXEC="npx"; fi

mkdir -p logs

# ------------------------------------------------------- build (prod) -------
if [[ "$MODE" == "prod" ]]; then
  info "Building for production ($PM_RUN build)..."
  # shellcheck disable=SC2086
  $PM_RUN build || die "Build failed — fix errors above."
  ok "Build complete (dist/)."
fi

URL="http://${HOST}:${PORT}"
[[ "$HOST" == "0.0.0.0" || "$HOST" == "::" ]] && URL="http://localhost:${PORT}"

if [[ "$FOREGROUND" -eq 1 ]]; then
  info "Starting ($MODE) in foreground → $URL  (Ctrl+C to stop)"
  if [[ "$MODE" == "prod" ]]; then
    # shellcheck disable=SC2086
    exec $PM_EXEC vite preview --port "$PORT" --host "$HOST"
  else
    # shellcheck disable=SC2086
    exec $PM_EXEC vite --port "$PORT" --host "$HOST"
  fi
fi

# ------------------------------------------------------- background ---------
info "Starting ($MODE) in background → $URL"
: > "$LOG_FILE"
if [[ "$MODE" == "prod" ]]; then
  # shellcheck disable=SC2086
  nohup $PM_EXEC vite preview --port "$PORT" --host "$HOST" >>"$LOG_FILE" 2>&1 &
else
  # shellcheck disable=SC2086
  nohup $PM_EXEC vite --port "$PORT" --host "$HOST" >>"$LOG_FILE" 2>&1 &
fi
APP_PID=$!
echo "$APP_PID" > "$PID_FILE"

# Wait until the port answers (max ~30s), else dump logs.
ready=0
for _ in $(seq 1 60); do
  sleep 0.5
  kill -0 "$APP_PID" 2>/dev/null || break   # process died → stop waiting
  if command -v curl >/dev/null 2>&1; then
    curl -sf -o /dev/null "http://127.0.0.1:${PORT}" && { ready=1; break; }
  else
    (echo >/dev/tcp/127.0.0.1/"$PORT") >/dev/null 2>&1 && { ready=1; break; }
  fi
done

if [[ "$ready" -eq 1 ]]; then
  ok "App running (PID $APP_PID, mode=$MODE)."
  echo "  URL:  $URL"
  echo "  Logs: $LOG_FILE"
  echo "  Stop: ./stop.sh"
  if [[ "$NO_OPEN" -eq 0 ]] && command -v xdg-open >/dev/null 2>&1 && [[ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]]; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  fi
  exit 0
fi

if kill -0 "$APP_PID" 2>/dev/null; then
  warn "Server started (PID $APP_PID) but port $PORT isn't answering yet — it may still be compiling."
  echo "  URL:  $URL"
  echo "  Logs: tail -f $LOG_FILE"
  exit 0
fi

rm -f "$PID_FILE"
die "Server failed to start. Last log lines:"$'\n'"$(tail -n 30 "$LOG_FILE" 2>/dev/null || echo '(no logs)')"
