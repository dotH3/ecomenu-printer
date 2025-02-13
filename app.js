const version = "v1.1.1";
const PORT = 3005;

const express = require("express");
const cors = require("cors");
const app = express();
const os = require("os");
const path = require("path");
const fs = require("fs");

const { logToFile } = require("./src/helpers/logToFile");
const { getPrinterList } = require("./src/services/getPrinterList");
const { postPrintFile } = require("./src/services/postPrintFile");

const multer = require("multer");
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
});

const destinationPath = path.join(os.homedir(), "Desktop", "ecomenu-printer");

fs.rmSync(destinationPath, { recursive: true, force: true });

const allowedOrigins = ["https://saas.ecomenuapp.com"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/printer-list", getPrinterList);
app.post("/print", upload.single("file"), postPrintFile);

app.use((err, req, res, next) => {
  res.status(500).send("Error interno del servidor");
  logToFile(`Error inesperado: ${err.message}`);
});

app.listen(PORT, () => {
  logToFile(`Servidor escuchando en el puert ${PORT} (${version})`);
});
