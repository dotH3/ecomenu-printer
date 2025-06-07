!define APP_NAME "ecomenu-printer"
!define EXE_NAME "ecomenu-printer.exe"
!define SUMATRA_NAME "sumatra.exe"
!define UNINSTALLER "uninstall-ecomenu-printer.exe"
!define ICON_FILE "icon.ico"
!define ICON_GRAY_SCALE_FILE "icon_gray_scale.ico" 
!define INSTALL_DIR "$LOCALAPPDATA\ecomenu-printer"
!define APP_VERSION "1.2.1"
!define INSTALLER_NAME "setup-ecomenu-printer-v${APP_VERSION}.exe"
!define WEB_URL "https://saas.ecomenuapp.com/"

OutFile "${INSTALLER_NAME}"

RequestExecutionLevel admin  ; Esto asegura que la instalación tenga privilegios elevados.

Section "Limpiar instalaciones previas"
    ; Inicializar variable
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Run\ecomenu-printer"
SectionEnd

Section "Instalar"
    ; Crear directorio de instalación
    CreateDirectory "${INSTALL_DIR}"

    SetOutPath "${INSTALL_DIR}"
    File "${EXE_NAME}"
    File "${SUMATRA_NAME}"
    File "${UNINSTALLER}"
    File "${ICON_FILE}"
    File "${ICON_GRAY_SCALE_FILE}"
    File "run_as_admin.bat"  ; Asegúrate de tener el archivo .bat en la misma carpeta que el .nsi

    ; Configurar el programa para que inicie con Windows
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}" "$\"${INSTALL_DIR}\run_as_admin.bat$\""

    ; Shortcut a la web de ECOMENU
    FileOpen $0 "$DESKTOP\Ecomenu.url" w
    FileWrite $0 "[InternetShortcut]$\r$\nURL=${WEB_URL}$\r$\nIconFile=$\"${INSTALL_DIR}\icon.ico$\"$\r$\nIconIndex=0$\r$\n"
    FileClose $0
    
    ; Preguntar al usuario si desea un acceso directo en el escritorio
    MessageBox MB_YESNO "crear un acceso directo de ${APP_NAME} en el escritorio?" IDYES CreateShortcutLabel

    ; Confirmar instalación
    MessageBox MB_OK "${APP_NAME} ha sido instalado correctamente."

    ; Crear acceso directo si el usuario eligió "Sí"
    CreateShortcutLabel:
        FileOpen $0 "$DESKTOP\Ecomenu Printer.url" w
        FileWrite $0 "[InternetShortcut]$\r$\nURL=file:///${INSTALL_DIR}/run_as_admin.bat$\r$\nIconFile=${INSTALL_DIR}\icon_gray_scale.ico$\r$\nIconIndex=0$\r$\n"
        FileClose $0

        ; CreateShortCut "$DESKTOP\Ecomenu Printer.lnk" "$\"${INSTALL_DIR}\run_as_admin.bat$\"" "$\"${INSTALL_DIR}\${ICON_GRAY_SCALE_FILE}$\"" 0

SectionEnd
