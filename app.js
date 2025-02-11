const version = 'v1.0.11'
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const { getPrinterList } = require('./src/getPrinterList');
const { logToFile } = require('./src/logToFile');
const app = express();
const PORT = 3005;
const cors = require("cors");

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 } 
});

// Configuración de CORS
const allowedOrigins = ["https://saas.ecomenuapp.com"]; // Reemplaza con el dominio de tu sitio web externo
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Si necesitas enviar cookies o cabeceras de autenticación
}));

// Middleware para parsear JSON
app.use(express.json());


const destinationPath = path.join(os.homedir(), 'Desktop', 'ecomenu-printer');
const htmlPath = path.join(destinationPath, 'file.html');
const pdfPath = path.join(destinationPath, 'file.pdf');

const esNumeroValido = (num) => typeof num === 'number' && num > 0 && /^[0-9]+(\.[0-9]{1,2})?$/.test(num);


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

    if(!req.body.width || !req.body.height){
        logToFile('No se proporcionó ningún tamaño de papel válido');
        return res.status(400).send('No se proporcionó ningún tamaño de papel válido. width y height');
    }
    if(isNaN(req.body.width) || isNaN(req.body.height) || req.body.width <= 0 || req.body.height <= 0){
        logToFile('No se proporcionó ningún tamaño de papel válido');
        return res.status(400).send('No se proporcionó ningún tamaño de papel válido. width y height');
    }

    // verificar el req.body.zoom
    if(!req.body.zoom || esNumeroValido(req.body.zoom)){
        return res.status(400).send('No se proporciono ningun zoom para el contenido. zoom')
    }

    // 

    fs.writeFile(htmlPath, req.file.buffer, (err) => {
        if (err) {
            logToFile(`Error guardando el archivo: ${err.message}`);
            return res.status(500).send('Error guardando el archivo');
        }
        // height: 210mm width: 58mm
        const wkhtmltopdfCommand = `powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom ${req.body.zoom} --images --page-height ${req.body.height} --page-width ${req.body.width} --margin-right 0 --margin-left 0 ${htmlPath} ${pdfPath}"`;

        exec(wkhtmltopdfCommand, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error ejecutando wkhtmltopdf, pero continuando: ${error.message}`);
            } else {
                logToFile('PDF generado exitosamente');
            }

            // Comando para imprimir el PDF
            // const printCommand = `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList ‘”${req.body.printerName}”’ -PassThru | % {Start-Sleep -Seconds 10; $_} | Stop-Process"`;
            const printCommand = `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList '\\"${req.body.printerName}\\"' -PassThru | % {Start-Sleep -Seconds 10; $_} | Stop-Process";`
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



app.listen(PORT, () => {
    logToFile(`Servidor escuchando en el puert ooo ${PORT} (${version})`);
});
