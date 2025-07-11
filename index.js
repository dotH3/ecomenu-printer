const version = "v1.2.2";
const PORT = 3005;

const express = require("express");
const cors = require("cors");
const app = express();
const os = require("os");
const path = require("path");
const fs = require("fs");

const { getPrinterList } = require("./src/services/getPrinterList");
const { postPrintFile } = require("./src/services/postPrintFile");

const fileSize = 200 * 1024 * 1024; // 200 MB

const multer = require("multer");
const { writeLog } = require("./src/misc/writeLog");
const uploadDir = path.join(os.homedir(), "Desktop", "ecomenu-printer");

//? Eliminar la carpeta y su contenido si existe
if (fs.existsSync(uploadDir)) {
  fs.rmSync(uploadDir, { recursive: true, force: true });
}
const upload = multer({
  limits: { fileSize },
  dest: path.join(os.homedir(), "Desktop", "ecomenu-printer"),
});

const allowedOrigins = [
  "https://saas.ecomenuapp.com",
  "https://test.ecomenuapp.com",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/printer-list", getPrinterList);
app.post("/print", upload.single("pdf"), postPrintFile);

app.use((err, req, res, next) => {
  res.status(500).send("Error interno del servidor");
});

app.listen(PORT, async() => {
  writeLog(`Servidor iniciado en el puerto ${PORT} (${version})`);
});
