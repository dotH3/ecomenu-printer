!define APP_NAME "ecomenu-printer"
!define INSTALL_DIR "$LOCALAPPDATA\ecomenu-printer"
!define UNINSTALLER_NAME "uninstall-ecomenu-printer.exe"

OutFile "${UNINSTALLER_NAME}"
RequestExecutionLevel admin

Section "Uninstall"
  ; Eliminar todo el contenido del directorio de instalación
  RMDir /r "${INSTALL_DIR}"
SectionEnd
