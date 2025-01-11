const express = require('express');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const app = express();

const PORT = 8088;

// Configuración de multer sin carpeta de destino
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 } // Límite: 10 MB
});

const logToFile = (message) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]; // Formato: YYYY-MM-DD HH:MM:SS
    const logMessage = `${timestamp} - ${message}\n`;

    fs.appendFile('logs.txt', logMessage, (err) => {
        if (err) {
            console.error(`Error escribiendo en el archivo de log: ${err.message}`);
            logToFile(`Error escribiendo en el archivo de log: ${err.message}`)
        }
    });
};


const getPrinterList = async (res) => {
    return new Promise((resolve, reject) => {
        const command = `Get-Printer | Format-List Name`;

        exec(`powershell -Command "${command}"`, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error al listar: ${error.message}`);
                reject(`Error al listar las impresoras disponibles`);
                return res.status(400).send(`Error al listar las impresoras disponibles`);
            }

            const printerArray = stdout
                .split('\n') // Dividir la salida en líneas
                .map(line => line.trim()) // Eliminar espacios innecesarios
                .filter(line => line.startsWith('Name :')) // Filtrar líneas que contienen 'Name :'
                .map(line => line.replace('Name :', '').trim()); // Remover 'Name :' y limpiar espacios

            resolve(printerArray);
        });
    });
};

app.get('/printer-list', async (req, res) => {
    const printerArray = await getPrinterList(res);
    return res.status(200).json(printerArray)
})

app.post('/print', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No se proporcionó ningún archivo.');
        logToFile('No se proporcionó ningún archivo.');
        return;
    }

    const printerName = req.body.printerName
    const printerExist = (await getPrinterList(res)).includes(printerName)

    if (!req.body.printerName | !printerExist) {
        res.status(400).send('No se proporcionó ningún printerName valido. GET/printer-list');
        logToFile('No se proporcionó ningún ninguna impresora valida');
        return;
    }

    const destinationPath = 'test.html';

    // Guardar el archivo subido como test.html
    fs.writeFile(destinationPath, req.file.buffer, (err) => {
        if (err) {
            console.error(`Error guardando el archivo: ${err.message}`);
            res.status(500).send('Error guardando el archivo');
            logToFile('Error guardando el archivo');
            return;
        }

        console.log('Archivo guardado como test.html');

        // Comando para convertir test.html a test.pdf
        const wkhtmltopdfCommand = 'powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom 1.3 --images --page-height 210 --page-width 58  --margin-right 0 --margin-left 0 test.html test.pdf"';

        exec(wkhtmltopdfCommand, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error ejecutando wkhtmltopdf, pero continuando: ${error.message}`);
            } else {
                console.log('PDF generado exitosamente');
            }

            // Comando para imprimir el PDF
            const printCommand = `Start-Process -FilePath 'test.pdf' -Verb PrintTo -ArgumentList '${req.body.printerName}' -PassThru | % {Start-Sleep -Seconds 10; $_} | Stop-Process`;

            exec(`powershell -Command "${printCommand}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error imprimiendo el PDF: ${error.message}`);
                    res.status(500).send('Error imprimiendo el PDF');
                    logToFile(`Error imprimiendo el PDF: ${error.message}`);
                    return;
                }

                console.log(`PDF enviado a la impresora exitosamente size:${req.file.size}`);
                logToFile(`PDF enviado a la impresora exitosamente size:${req.file.size}`);
                res.send('PDF generado e impreso exitosamente');
            });
        });
    });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(`Error inesperado: ${err.message}`);
    res.status(500).send('Error interno del servidor');
    logToFile(`Error inesperado: ${err.message}`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    logToFile(`Servidor escuchando en el puerto ${PORT}`);
});
