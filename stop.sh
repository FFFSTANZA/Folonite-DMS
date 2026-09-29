#!/usr/bin/env bash
#
# stop.sh — stop the Folonite DMS application started by start.sh.
#
# Usage:
#   ./stop.sh [--port PORT] [--all] [--no-color]
#
# Default: reads .app.pid, stops that process gracefully (TERM → KILL).
# Also sweeps any leftover vite dev/preview processes for this project
# and frees the app ports (5173 dev, 4173 preview, or --port).
#   --all   kill every vite process for this project even without a PID file.
#
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
APP_ROOT="$SCRIPT_DIR"
cd "$APP_ROOT"

PORT_OVERRIDE=""; KILL_ALL=0; NO_COLOR=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port=*)    PORT_OVERRIDE="${1#--port=}"; shift ;;
    --port)      PORT_OVERRIDE="${2:?ERROR: --port needs a value}"; shift 2 ;;
    --all)       KILL_ALL=1; shift ;;
    --no-color)  NO_COLOR=1; shift ;;
    -h|--help)
      awk '/^#!/&&NR==1{next} /^\s*#/{sub(/^\s*# ?/,"");print;next} {exit}' "$0"
      echo "Options: [--port PORT] [--all] [--no-color]"
      exit 0 ;;
    *) echo "ERROR: unknown option: $1 (see --help)" >&2; exit 2 ;;
  esac
done

if [[ "$NO_COLOR" -eq 1 || "${TERM:-dumb}" == "dumb" || ! -t 1 ]]; then
  C_RESET=""; C_INFO=""; C_OK=""; C_WARN=""; C_ERR=""
else
  C_RESET="\033[0m"; C_INFO="\033[1;34m"; C_OK="\033[1;32m"
  C_WARN="\033[1;33m"; C_ERR="\033[1;31m"
fi
info() { echo -e "${C_INFO}[stop]${C_RESET} $*"; }
ok()   { echo -e "${C_OK}[stop] ✓${C_RESET} $*"; }
warn() { echo -e "${C_WARN}[stop] !${C_RESET} $*" >&2; }

PID_FILE="$APP_ROOT/.app.pid"
DEFAULT_PORTS=(5173 4173)
PORTS=()
[[ -n "$PORT_OVERRIDE" ]] && PORTS=("$PORT_OVERRIDE") || PORTS=("${DEFAULT_PORTS[@]}")

stop_pid() {  # $1=pid → 0 if stopped/gone, 1 if still alive
  local pid="$1" i
  kill -TERM "$pid" 2>/dev/null || return 0
  for i in $(seq 1 20); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.5
  done
  kill -KILL "$pid" 2>/dev/null || true
  sleep 0.5
  kill -0 "$pid" 2>/dev/null && return 1 || return 0
}

pids_on_port() {  # $1=port → echo pids listening on it
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$p" -sTCP:LISTEN -t 2>/dev/null || true
  elif command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | grep -E ":${p}[[:space:]]" | grep -oP 'pid=\K[0-9]+' | sort -u || true
  elif command -v fuser >/dev/null 2>&1; then
    fuser "${p}/tcp" 2>/dev/null || true
  fi
}

project_vite_pids() {  # vite processes whose cmdline touches this project
  ps -eo pid,args 2>/dev/null | grep "[v]ite" | grep -F "$APP_ROOT" | awk '{print $1}' || true
}

stopped_any=0

# ------------------------------------------------ 1. PID file -------------
if [[ -f "$PID_FILE" ]]; then
  pid="$(tr -d '[:space:]' < "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    info "Stopping app (PID $pid)..."
    if stop_pid "$pid"; then ok "Stopped PID $pid."; stopped_any=1;
    else warn "PID $pid would not die — check manually: kill -9 $pid"; fi
  elif [[ -n "$pid" ]]; then
    info "PID $pid already gone — cleaning stale PID file."
  fi
  rm -f "$PID_FILE"
elif [[ "$KILL_ALL" -eq 0 ]]; then
  info "No .app.pid — nothing started by start.sh found."
fi

# ------------------------------------------------ 2. project vite sweep ----
sweep_pids=""
if [[ "$KILL_ALL" -eq 1 ]] || [[ ! -f "$PID_FILE" ]]; then
  sweep_pids="$(project_vite_pids)"
  # never suicide: drop our own shell / parents
  for p in $sweep_pids; do
    [[ "$p" == "$$" ]] && continue
    if kill -0 "$p" 2>/dev/null; then
      info "Stopping leftover vite process (PID $p)..."
      if stop_pid "$p"; then ok "Stopped PID $p."; stopped_any=1;
      else warn "PID $p would not die — check manually."; fi
    fi
  done
fi

# ------------------------------------------------ 3. free ports ------------
for p in "${PORTS[@]}"; do
  for pid in $(pids_on_port "$p"); do
    [[ "$pid" == "$$" ]] && continue
    # Only touch node/vite listeners, never random services.
    if ps -p "$pid" -o comm= 2>/dev/null | grep -qiE 'node|vite'; then
      info "Freeing port $p (PID $pid)..."
      if stop_pid "$pid"; then ok "Port $p freed."; stopped_any=1;
      else warn "Could not free port $p (PID $pid)."; fi
    else
      warn "Port $p held by non-node PID $pid — leaving it alone."
    fi
  done
done

if [[ -f "$PID_FILE" ]]; then rm -f "$PID_FILE"; fi

if [[ "$stopped_any" -eq 1 ]]; then
  ok "Application stopped."
else
  ok "Nothing running — app is stopped."
fi
