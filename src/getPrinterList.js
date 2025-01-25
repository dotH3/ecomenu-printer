const { exec } = require('child_process');

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

module.exports = {
    getPrinterList
}