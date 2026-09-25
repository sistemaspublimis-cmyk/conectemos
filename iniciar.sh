#!/usr/bin/env bash
# Un solo comando: instala lo necesario, crea la base y abre Conectemos.
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/opt/node/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
export CI=true
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_UPDATE_NOTIFIER=false

RUNTIME="$ROOT/.runtime"
LOG="$RUNTIME/iniciar.log"
PIDFILE="$RUNTIME/server.pid"
PORTFILE="$RUNTIME/port"
NODE_DIST="22.18.0"
MARKER="Conectemos"

mkdir -p "$RUNTIME" uploads prisma
touch "$LOG"

say()  { printf "\n\033[1;36m==>\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m    OK\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m    !\033[0m %s\n" "$*"; }
die()  { printf "\n\033[1;31mERROR:\033[0m %s\n\nLog: %s\n" "$*" "$LOG" >&2; exit 1; }

need_net() {
  if ! curl -fsS --max-time 8 https://registry.npmjs.org/next >/dev/null 2>&1; then
    die "Esta computadora necesita internet la primera vez (para instalar Node y librerías)."
  fi
}

os_name() {
  case "$(uname -s)" in
    Darwin) echo darwin ;;
    Linux)  echo linux ;;
    *)      echo other ;;
  esac
}

cpu_name() {
  case "$(uname -m)" in
    arm64|aarch64) echo arm64 ;;
    x86_64|amd64)  echo x64 ;;
    *)             echo x64 ;;
  esac
}

node_major() {
  node -p "parseInt(process.versions.node,10)" 2>/dev/null || echo 0
}

load_nvm() {
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
  fi
  if command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env 2>/dev/null)" || true
  fi
  if [ -d "$HOME/.nvm/versions/node" ]; then
    local latest
    latest="$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -1)"
    if [ -n "$latest" ]; then
      export PATH="$HOME/.nvm/versions/node/$latest/bin:$PATH"
    fi
  fi
}

install_portable_node() {
  local os arch url tarball dest
  os="$(os_name)"
  arch="$(cpu_name)"
  [ "$os" = "other" ] && die "Sistema no soportado. Instala Node.js 18+ desde https://nodejs.org y vuelve a ejecutar INICIAR."

  url="https://nodejs.org/dist/v${NODE_DIST}/node-v${NODE_DIST}-${os}-${arch}.tar.gz"
  tarball="$RUNTIME/node.tgz"
  dest="$RUNTIME/node"

  say "No hay Node.js 18+. Descargando una copia local (no pide contraseña)…"
  need_net
  rm -rf "$dest" "$tarball"
  curl -fL --retry 3 --retry-delay 2 -o "$tarball" "$url" || die "No se pudo descargar Node.js. Instálalo desde https://nodejs.org y vuelve a dar clic en INICIAR."
  tar -xzf "$tarball" -C "$RUNTIME"
  rm -f "$tarball"
  rm -rf "$dest"
  mv "$RUNTIME/node-v${NODE_DIST}-${os}-${arch}" "$dest"
  export PATH="$dest/bin:$PATH"
  ok "Node local $(node -v)"
}

ensure_node() {
  load_nvm
  if [ -x "$RUNTIME/node/bin/node" ]; then
    export PATH="$RUNTIME/node/bin:$PATH"
  fi
  if command -v node >/dev/null 2>&1 && [ "$(node_major)" -ge 18 ]; then
    ok "Node $(node -v) · npm $(npm -v)"
    return
  fi
  if command -v brew >/dev/null 2>&1; then
    say "Instalando Node.js con Homebrew…"
    brew install node
    if command -v node >/dev/null 2>&1 && [ "$(node_major)" -ge 18 ]; then
      ok "Node $(node -v)"
      return
    fi
  fi
  install_portable_node
  command -v node >/dev/null 2>&1 || die "No se encontró Node.js."
  [ "$(node_major)" -ge 18 ] || die "Se necesita Node.js 18 o superior. Hay $(node -v)."
}

ensure_env() {
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      cp .env.example .env
    else
      die "Falta .env.example en la carpeta del proyecto."
    fi
    ok "Archivo .env creado"
  fi
  if grep -q "cambia-este-secreto" .env 2>/dev/null; then
    local secret
    secret="$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets;print(secrets.token_hex(32))')"
    if [ "$(uname -s)" = "Darwin" ]; then
      sed -i '' "s/cambia-este-secreto-largo-en-produccion/${secret}/" .env
    else
      sed -i "s/cambia-este-secreto-largo-en-produccion/${secret}/" .env
    fi
    ok "Secreto de sesión generado"
  fi
}

port_busy() {
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "$p" >/dev/null 2>&1
    return $?
  fi
  return 1
}

page_is_alux() {
  local target="$1"
  curl -fsS --max-time 3 "$target" 2>/dev/null | grep -q "$MARKER"
}

our_server_alive() {
  if [ ! -f "$PIDFILE" ] || [ ! -f "$PORTFILE" ]; then
    return 1
  fi
  local old port
  old="$(cat "$PIDFILE" 2>/dev/null || true)"
  port="$(cat "$PORTFILE" 2>/dev/null || true)"
  [ -n "$old" ] && [ -n "$port" ] || return 1
  kill -0 "$old" 2>/dev/null || return 1
  page_is_alux "http://127.0.0.1:$port"
}

pick_port() {
  local p=3110
  while [ "$p" -le 3120 ]; do
    if ! port_busy "$p"; then
      echo "$p"
      return
    fi
    p=$((p + 1))
  done
  die "No hay puerto libre entre 3110 y 3120. Cierra otras apps y vuelve a intentar."
}

open_browser() {
  local target="$1"
  if [ "${ALUX_NO_OPEN:-}" = "1" ]; then
    return
  fi
  case "$(uname -s)" in
    Darwin) open -a "Google Chrome" "$target" >/dev/null 2>&1 || open "$target" >/dev/null 2>&1 || true ;;
    Linux)  xdg-open "$target" >/dev/null 2>&1 || true ;;
  esac
}

wait_ready() {
  local target="$1"
  local i=0
  while [ "$i" -lt 120 ]; do
    if page_is_alux "$target"; then
      return 0
    fi
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      return 1
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

install_deps() {
  if [ -d node_modules/next ] && [ -d node_modules/@prisma/client ] && [ -d node_modules/tsx ]; then
    ok "Librerías ya instaladas"
    return
  fi
  say "Instalando librerías (solo la primera vez, 1–3 minutos)…"
  need_net
  if [ -f package-lock.json ]; then
    npm ci --no-fund --no-audit
  else
    npm install --no-fund --no-audit
  fi
  ok "Librerías listas"
}

setup_db() {
  say "Preparando base de datos…"
  npx prisma generate
  npx prisma db push --skip-generate
  npx prisma db seed
  ok "Base lista (cuentas de demo creadas)"
}

print_accounts() {
  printf "
  Plataforma lista en:  \033[1m%s\033[0m

  Administrador
    correo      admin@conectemos.mx
    contraseña  Conectemos2026!

  Gerencia
    correo      gerencia@conectemos.mx
    contraseña  Conectemos2026!

  Cliente
    correo      maria.demo@conectemos.mx
    contraseña  DemoCjc2026!

  Deja esta ventana abierta mientras uses Conectemos.
  Para apagar: Ctrl+C o cierra la ventana.

" "$URL"
}

# ── arranque ──────────────────────────────────────────────
if [ -t 1 ] && [ "${ALUX_NO_OPEN:-}" != "1" ]; then
  clear 2>/dev/null || true
fi

cat <<'BANNER'
  ╔════════════════════════════════════════════════════╗
  ║   Conectemos  ·  SOFOM E.N.R.                    ║
  ║   Instalación y arranque en un solo paso           ║
  ╚════════════════════════════════════════════════════╝
BANNER

say "1/4  Comprobando Node.js"
ensure_node

say "2/4  Configuración"
ensure_env

say "3/4  Dependencias y base de datos"
install_deps
setup_db

if our_server_alive; then
  PORT="$(cat "$PORTFILE")"
  URL="http://localhost:${PORT}"
  say "4/4  Ya estaba encendida"
  ok "$URL"
  print_accounts
  open_browser "$URL"
  if [ "${ALUX_NO_OPEN:-}" != "1" ]; then
    echo "Pulsa Enter para cerrar esta ventana (la plataforma sigue abierta)."
    read -r _ || true
  fi
  exit 0
fi

PORT="$(pick_port)"
URL="http://localhost:${PORT}"
if grep -q '^APP_URL=' .env; then
  if [ "$(uname -s)" = "Darwin" ]; then
    sed -i '' "s|^APP_URL=.*|APP_URL=\"${URL}\"|" .env
  else
    sed -i "s|^APP_URL=.*|APP_URL=\"${URL}\"|" .env
  fi
fi

say "4/4  Encendiendo Conectemos en el puerto $PORT"

npx next dev --turbopack --hostname 0.0.0.0 --port "$PORT" >>"$LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PIDFILE"
echo "$PORT" > "$PORTFILE"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
}
trap cleanup INT TERM HUP EXIT

if ! wait_ready "$URL"; then
  warn "Últimas líneas del log:"
  tail -n 50 "$LOG" || true
  die "La plataforma no respondió a tiempo. Vuelve a dar clic en INICIAR."
fi

ok "Servidor en marcha"
print_accounts
open_browser "$URL"

# No matar el servidor al salir con éxito: quitamos EXIT trap y esperamos.
trap - EXIT
trap cleanup INT TERM HUP
wait "$SERVER_PID"
cleanup
