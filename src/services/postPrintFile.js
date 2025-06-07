const path = require("path");
const os = require("os");

const fs = require("fs");
const { print } = require("pdf-to-printer");
const { writeLog } = require("../misc/writeLog");

const destinationPath = path.join(os.homedir(), "Desktop", "ecomenu-printer");

const postPrintFile = async (req, res) => {
  writeLog("Recibiendo solicitud de impresión...");
  const printerName = req.body.printer || req.body.printer_name;
  if (!printerName) {
    return res.status(400).send('Falta campo "printer_name"');
  }
  if (!req.file) {
    return res.status(400).send('Falta archivo "pdf"');
  }

  const tmpPath = req.file.path;
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  const finalPath = path.join(destinationPath, `${path.basename(tmpPath)}.pdf`);
  fs.renameSync(tmpPath, finalPath);

  writeLog(`Imprimiendo PDF (${finalPath}) en impresora "${printerName}"`);

  try {
    const options = {
      printer: printerName,
      scale: "shrink",
      // shrink
      // fit
      // noscale
    };
    await print(finalPath, options);
    // await print(`./uploads/ej.pdf`, options);

    writeLog(`PDF enviado a impresión en "${printerName}"`);
    return res.json({ status: "Impresión enviada", path: finalPath });
  } catch (error) {
    console.error("Error al imprimir el PDF:", error);
    return res.status(500).send(`Error al imprimir: ${error.message || error}`);
  }
};

module.exports = {
  postPrintFile,
};
