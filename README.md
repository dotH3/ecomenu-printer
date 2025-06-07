<p align="center">
  <img src="https://saas.ecomenuapp.com/public/ecomenu-logo.jpg" width="200" alt="Ecomenu Logo" style="box-shadow: 0 4px 12px rgba(0,0,0,0.2); opacity: 0.9; border-radius: 12px;" />
</p>

<h3 align="center">Ecomenu Printer</h3>
<p align="center">Application to manage printers through HTTP requests. It’s designed specifically to be integrated with the software Ecomenu, allowing us to print in an efficient and scalable way.</p>

> [!WARNING]  
> **REACTIVATED**. This repository is now maintained again.  
> Active development also continues in [this repo](https://github.com/dotH3/ecomenu-printer-rust), built with **Rust**.

## Features

- 🖨️ Management of local and network printers.
- 🌐 HTTP API to manage print requests.
- ⚡️ Fast and lightweight.
- 🍔 Optimized for integration with **Ecomenu**.

## Endpoints

| Method |    Endpoint     |               Description                |  Required Form-Data   |
| :----: | :-------------: | :--------------------------------------: | :-------------------: |
|  GET   | `/printer-list` | Lists printers configured in the system. |         None          |
|  POST  |    `/print`     |                Prints PDF                | `printer_name`, `pdf` |
