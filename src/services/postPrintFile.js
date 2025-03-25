const path = require("path");
const os = require("os");
const { printerList } = require("../helpers/printerList");
const { saveHTML } = require("../helpers/saveHTML");
const { HTMLToPDF } = require("../helpers/HTMLToPDF");
const { printPDF } = require("../helpers/printPDF");
const { logToFile } = require("../helpers/logToFile");

const esNumeroValido = (num) =>
  typeof num === "number" && num > 0 && /^[0-9]+(\.[0-9]{1,2})?$/.test(num);
const destinationPath = path.join(os.homedir(), "Desktop", "ecomenu-printer");

const postPrintFile = async (req, res) => {
  try {
    logToFile("POST /print");
    const validation = await validarParametros(req, res);
    if (validation) {
      throw new Error(validation);
    }

    const htmlFile = await saveHTML(req.file.buffer);
    logToFile(`HTML guardado exitosamente: ${htmlFile}`);
    const pdfFile = await HTMLToPDF(htmlFile, {
      zoom: req.body.zoom,
      height: req.body.height,
      width: req.body.width,
    });
    logToFile(`PDF generado exitosamente: ${pdfFile}`);

    const gonnaPrint = await printPDF(pdfFile, req.body.printerName)
    logToFile(`PDF enviado a la impresora exitosamente: ${gonnaPrint}`);

    return res.send({htmlFile, pdfFile});
  } catch (error) {
    console.error(error);
    logToFile(`Error inesperado: ${error.message}`);
    res.status(400).send(error.message);
  }
  //   fs.writeFile(htmlPath, req.file.buffer, (err) => {
  //     if (err) {
  //       logToFile(`Error guardando el archivo: ${err.message}`);
  //       return res.status(500).send("Error guardando el archivo");
  //     }
  //     // height: 210mm width: 58mm
  //     const wkhtmltopdfCommand = `powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom ${req.body.zoom} --images --page-height ${req.body.height} --page-width ${req.body.width} --margin-right 0 --margin-left 0 ${htmlPath} ${pdfPath}"`;

  //     exec(wkhtmltopdfCommand, (error, stdout, stderr) => {
  //       if (error) {
  //         console.warn(
  //           `Error ejecutando wkhtmltopdf, pero continuando: ${error.message}`
  //         );
  //       } else {
  //         logToFile("PDF generado exitosamente");
  //       }

  //       const printCommand = `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList '\\"${req.body.printerName}\\"' -PassThru | % {Start-Sleep -Seconds 10; $_} | Stop-Process";`;

  //       exec(printCommand, (error, stdout, stderr) => {
  //         if (error) {
  //           console.error(`Error imprimiendo el PDF: ${error.message}`);
  //           logToFile(`Error imprimiendo el PDF: ${error.message}`);
  //           return res.status(500).send("Error imprimiendo el PDF");
  //         }

  //         logToFile(
  //           `PDF enviado a la impresora exitosamente size:${req.file.size}`
  //         );
  //         return res.send("PDF generado e impreso exitosamente");
  //       });
  //     });
  //   });
};

const validarParametros = async (req, res) => {
  if (!req.file) {
    return "No se proporcionó ningún archivo.";
  }

  const printerName = req.body.printerName;
  const printerExist = (await printerList(res)).includes(printerName);

  if (!printerName || !printerExist)
    return "No se proporcionó ningún printerName válido. GET/printer-list";

  if (!req.body.width || !req.body.height)
    return "No se proporcionó ningún tamaño de papel válido. width y height";

  if (
    isNaN(req.body.width) ||
    isNaN(req.body.height) ||
    req.body.width <= 0 ||
    req.body.height <= 0
  )
    return "No se proporcionó ningún tamaño de papel válido. width y height";

  if (!req.body.zoom || esNumeroValido(req.body.zoom))
    return "No se proporcionó ningún zoom para el contenido. zoom";

  return false;
};

module.exports = {
  postPrintFile,
};
