#!/bin/zsh
cd "$(dirname "$0")"
chmod +x iniciar.sh INICIAR.command 2>/dev/null || true
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo
echo "  Si macOS bloquea este archivo: clic derecho → Abrir → Abrir."
echo

/bin/bash "./iniciar.sh"
status=$?

if [ $status -ne 0 ]; then
  echo
  echo "Algo falló. La ventana se queda abierta para que leas el error."
  echo "Pulsa Enter para cerrar."
  read -r _
fi
exit $status
