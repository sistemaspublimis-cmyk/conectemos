#!/bin/zsh
cd "/Users/user2/Desktop/Paginas web demo/conectemos"
chmod +x iniciar.sh INICIAR.command "Iniciar Conectemos.command" 2>/dev/null || true
exec /bin/zsh "./INICIAR.command"
