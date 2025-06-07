> [!WARNING]  
> **REACTIVATED**. This repository is now maintained again.  
> However, active development also continues in [this repo](https://github.com/dotH3/ecomenu-printer-rust), built with **Rust**.


# ecomenu-printer

**ecomenu-printer** es una aplicación nativa desarrollada para manejar impresoras a través de solicitudes HTTP. Diseñada específicamente para integrarse con el SaaS **Ecomenu**, permite realizar impresiones de manera eficiente y escalable en entornos Windows.

## Características

- 🖨️ Manejo de impresoras locales y en red compatibles con Windows.
- 🌐 API HTTP para gestionar solicitudes de impresión.
- 🍔 Optimizado para integrarse con **Ecomenu** y operar en sistemas Windows.


## Endpoint
- **GET/printer-list** lista de impresoras configuradas en windows 
- **POST/print** imprimir html (printerName, height, width, zoom).
