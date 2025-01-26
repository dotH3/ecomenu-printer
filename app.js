const version = 'v1.0.5'
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const { getPrinterList } = require('./src/getPrinterList');
const { logToFile } = require('./src/logToFile');
const app = express();
const PORT = 8088;

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 } 
});

const destinationPath = path.join(os.homedir(), 'Desktop', 'ecomenu-printer');
const htmlPath = path.join(destinationPath, 'file.html');
const pdfPath = path.join(destinationPath, 'file.pdf');

if (!fs.existsSync(destinationPath)) {
    console.log("Creando directorio de destino",destinationPath)
    fs.mkdirSync(destinationPath, { recursive: true });
}

app.get('/printer-list', async (req, res) => {
    console.log('GET /printer-list');
    const printerArray = await getPrinterList(res);
    return res.status(200).json(printerArray)
})

app.post('/print', upload.single('file'), async (req, res) => {
    console.log('POST /print');
    if (!req.file) {
        logToFile('No se proporcionó ningún archivo.');
        return res.status(400).send('No se proporcionó ningún archivo.');
    }

    const printerName = req.body.printerName;
    const printerExist = (await getPrinterList(res)).includes(printerName);

    if (!req.body.printerName || !printerExist) {
        logToFile('No se proporcionó ninguna impresora válida');
        return res.status(400).send('No se proporcionó ningún printerName válido. GET/printer-list');
    }

    if(!req.body.witdh || !req.body.height){
        logToFile('No se proporcionó ningún tamaño de papel válido');
        return res.status(400).send('No se proporcionó ningún tamaño de papel válido. width y height');
    }
    if(isNaN(req.body.width) || isNaN(req.body.height) || req.body.width <= 0 || req.body.height <= 0){
        logToFile('No se proporcionó ningún tamaño de papel válido');
        return res.send('No se proporcionó ningún tamaño de papel válido. width y height');
    }

    // 

    fs.writeFile(htmlPath, req.file.buffer, (err) => {
        if (err) {
            logToFile(`Error guardando el archivo: ${err.message}`);
            return res.status(500).send('Error guardando el archivo');
        }
        // height: 210mm width: 58mm
        const wkhtmltopdfCommand = `powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom 1.3 --images --page-height ${req.body.height} --page-width ${req.body.width} --margin-right 0 --margin-left 0 ${htmlPath} ${pdfPath}"`;

        exec(wkhtmltopdfCommand, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error ejecutando wkhtmltopdf, pero continuando: ${error.message}`);
            } else {
                logToFile('PDF generado exitosamente');
            }

            // Comando para imprimir el PDF
            const printCommand = `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList ‘”${req.body.printerName}”’ -PassThru | % {Start-Sleep -Seconds 10; $_} | Stop-Process"`;

            console.log(printCommand)

            exec(printCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error imprimiendo el PDF: ${error.message}`);
                    logToFile(`Error imprimiendo el PDF: ${error.message}`);
                    return res.status(500).send('Error imprimiendo el PDF');
                }

                logToFile(`PDF enviado a la impresora exitosamente size:${req.file.size}`);
                return res.send('PDF generado e impreso exitosamente');
            });
        });
    });
})

app.use((err, req, res, next) => {
    res.status(500).send('Error interno del servidor');
    logToFile(`Error inesperado: ${err.message}`);
});

app.listen(PORT, '0.0.0.0', () => {
    logToFile(`Servidor escuchando en el puerto ${PORT} (${version})`);
});
