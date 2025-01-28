!define APP_NAME "ecomenu-printer"
!define EXE_NAME "ecomenu-printer.exe"
!define WKHTMLTOPDF "wkhtmltopdf.exe"
!define INSTALL_DIR "$LOCALAPPDATA\ecomenu-printer"
!define APP_VERSION "1.0.8"
!define INSTALLER_NAME "setup-ecomenu-printer-v${APP_VERSION}.exe"

OutFile "${INSTALLER_NAME}"

Var foundPreviousInstall

RequestExecutionLevel admin  ; Esto asegura que la instalación tenga privilegios elevados.

Section "Limpiar instalaciones previas"
    ; Inicializar variable
    StrCpy $foundPreviousInstall "0"

    ; Comprobar si la clave de registro existe
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}"
    StrCmp $0 "" NoPreviousInstall

    ; Si se encontró una instalación previa
    MessageBox MB_ICONINFORMATION "${APP_NAME}: Se detectó una instalación previa. Eliminando configuraciones..."
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Run\ecomenu-printer"
    StrCpy $foundPreviousInstall "1"

    NoPreviousInstall:
SectionEnd

Section "Instalar"
    ; Crear directorio de instalación
    CreateDirectory "${INSTALL_DIR}"

    ; Copiar archivo ejecutable, wkhtmltopdf y el archivo .bat
    SetOutPath "${INSTALL_DIR}"
    File "${EXE_NAME}"
    File "${WKHTMLTOPDF}"
    File "run_as_admin.bat"  ; Asegúrate de tener el archivo .bat en la misma carpeta que el .nsi

    ; Configurar el programa para que inicie con Windows
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}" "$\"${INSTALL_DIR}\run_as_admin.bat$\""

    ; Preguntar al usuario si desea un acceso directo en el escritorio
    MessageBox MB_YESNO "¿Desea crear un acceso directo de ${APP_NAME} en el escritorio?" IDYES CreateShortcutLabel

    ; Confirmar instalación
    MessageBox MB_OK "${APP_NAME} ha sido instalado correctamente."

    ; Crear acceso directo si el usuario eligió "Sí"
    CreateShortcutLabel:
        CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$\"${INSTALL_DIR}\run_as_admin.bat$\""
SectionEnd
