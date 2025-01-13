!define APP_NAME "ecomenu-printer"
!define EXE_NAME "ecomenu-printer.exe"
!define INSTALL_DIR "$PROGRAMFILES64\${APP_NAME}"

SetCompressor /SOLID lzma


Section "Desinstalar"
    ; Eliminar programa del inicio
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Run\${APP_NAME}"

    ; Borrar directorio y archivos
    RMDir /r "${INSTALL_DIR}"

    ; Confirmar desinstalación
    MessageBox MB_OK "${APP_NAME} ha sido desinstalado."
SectionEnd


Section "Instalar"
    ; Crear directorio
    CreateDirectory "${INSTALL_DIR}"

    ; Copiar archivo .exe
    SetOutPath "${INSTALL_DIR}"
    File "${EXE_NAME}"

    ; Configurar el programa para que inicie con Windows
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}" "$\"${INSTALL_DIR}\${EXE_NAME}$\""

    ; Confirmar instalación
    MessageBox MB_OK "${APP_NAME} ha sido instalado correctamente."
SectionEnd
