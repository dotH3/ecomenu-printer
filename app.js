const version = 'v1.0.4'
const express = require('express');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const { getPrinterList } = require('./src/getPrinterList');
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

const logToFile = (message) => {
    console.log(message);
}

app.get('/printer-list', async (req, res) => {
    console.log('GET /printer-list');
    const printerArray = await getPrinterList(res);
    res.status(200).json(printerArray)
    return
})

app.post('/print', upload.single('file'), async (req, res) => {
    console.log('POST /print');
    if (!req.file) {
        res.status(400).send('No se proporcionó ningún archivo.');
        logToFile('No se proporcionó ningún archivo.');
        return;
    }

    const printerName = req.body.printerName;
    const printerExist = (await getPrinterList(res)).includes(printerName);

    if (!req.body.printerName || !printerExist) {
        res.status(400).send('No se proporcionó ningún printerName válido. GET/printer-list');
        logToFile('No se proporcionó ninguna impresora válida');
        return;
    }

    fs.writeFile(htmlPath, req.file.buffer, (err) => {
        if (err) {
            res.status(500).send('Error guardando el archivo');
            logToFile(`Error guardando el archivo: ${err.message}`);
            return;
        }
        const wkhtmltopdfCommand = `powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom 1.3 --images --page-height 210 --page-width 58 --margin-right 0 --margin-left 0 ${htmlPath} ${pdfPath}"`;

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
                    res.status(500).send('Error imprimiendo el PDF');
                    logToFile(`Error imprimiendo el PDF: ${error.message}`);
                    return;
                }

                logToFile(`PDF enviado a la impresora exitosamente size:${req.file.size}`);
                res.send('PDF generado e impreso exitosamente');
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
